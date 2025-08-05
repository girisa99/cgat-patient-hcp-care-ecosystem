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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive 21-slide implementation guide for treatment centers featuring advanced AI agent platform
          </p>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "Executive Summary",
    subtitle: "AI-Powered Treatment Center Transformation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary">🎯 Mission</h3>
            <p className="text-muted-foreground">
              Transform treatment centers with AI-driven automation, improving patient outcomes and operational efficiency through intelligent workflow management.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-primary">📊 Key Metrics</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• 40% reduction in administrative tasks</li>
              <li>• 60% faster patient intake processing</li>
              <li>• 85% improvement in compliance tracking</li>
              <li>• 50% increase in staff productivity</li>
            </ul>
          </Card>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            ROI: 300% within 12 months
          </Badge>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Current Challenges in Treatment Centers",
    subtitle: "Identifying Pain Points for AI Solutions",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-destructive">⚠️ Administrative Burden</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Manual patient intake processes</li>
              <li>• Paper-based documentation</li>
              <li>• Redundant data entry</li>
              <li>• Time-consuming insurance verification</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-destructive">📋 Compliance Issues</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Manual compliance tracking</li>
              <li>• Inconsistent documentation</li>
              <li>• Audit preparation challenges</li>
              <li>• Regulatory reporting delays</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-destructive">👥 Staff Challenges</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• High administrative workload</li>
              <li>• Limited time for patient care</li>
              <li>• Staff burnout and turnover</li>
              <li>• Training inconsistencies</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-destructive">💰 Financial Impact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Revenue cycle inefficiencies</li>
              <li>• Insurance claim delays</li>
              <li>• Operational cost increases</li>
              <li>• Resource allocation issues</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "AI Solution Overview",
    subtitle: "Comprehensive Automation Platform",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <div className="text-3xl">🧠</div>
          </div>
          <p className="text-lg text-muted-foreground">
            Intelligent AI agents working 24/7 to streamline operations
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="font-semibold mb-2">Smart Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Automated form filling, data extraction, and document generation
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="font-semibold mb-2">Workflow Automation</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent task routing and process optimization
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="font-semibold mb-2">Analytics & Insights</h3>
            <p className="text-sm text-muted-foreground">
              Real-time reporting and predictive analytics
            </p>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "AI Agent Architecture",
    subtitle: "Multi-Agent System Design",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🤖 Core Agents</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold">Intake Agent</h4>
                <p className="text-sm text-muted-foreground">Handles patient onboarding and initial assessments</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">Documentation Agent</h4>
                <p className="text-sm text-muted-foreground">Manages clinical notes and treatment plans</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">Compliance Agent</h4>
                <p className="text-sm text-muted-foreground">Ensures regulatory adherence and audit readiness</p>
              </Card>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">⚙️ Support Agents</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold">Scheduling Agent</h4>
                <p className="text-sm text-muted-foreground">Optimizes appointments and resource allocation</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">Billing Agent</h4>
                <p className="text-sm text-muted-foreground">Automates insurance claims and payment processing</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">Analytics Agent</h4>
                <p className="text-sm text-muted-foreground">Provides insights and performance metrics</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Patient Intake Automation",
    subtitle: "Streamlined Onboarding Process",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📋 Before AI</h3>
            <Card className="p-4 border-destructive">
              <ul className="space-y-2 text-muted-foreground">
                <li>• 2-3 hours manual intake process</li>
                <li>• Multiple form completions</li>
                <li>• Manual insurance verification</li>
                <li>• Paper-based documentation</li>
                <li>• Staff-intensive process</li>
                <li>• High error rates</li>
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🚀 After AI</h3>
            <Card className="p-4 border-green-500">
              <ul className="space-y-2 text-muted-foreground">
                <li>• 30-minute automated intake</li>
                <li>• Single digital form</li>
                <li>• Real-time insurance verification</li>
                <li>• Digital document management</li>
                <li>• Minimal staff intervention</li>
                <li>• 95% accuracy rate</li>
              </ul>
            </Card>
          </div>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="text-lg px-6 py-3">
            75% Time Reduction | 90% Error Reduction
          </Badge>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Clinical Documentation AI",
    subtitle: "Intelligent Note-Taking and Treatment Planning",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-3xl mb-4 text-center">🎤</div>
            <h3 className="font-semibold mb-2 text-center">Voice-to-Text</h3>
            <p className="text-sm text-muted-foreground text-center">
              Real-time transcription of clinical sessions with 98% accuracy
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-3xl mb-4 text-center">📝</div>
            <h3 className="font-semibold mb-2 text-center">Smart Templates</h3>
            <p className="text-sm text-muted-foreground text-center">
              AI-generated treatment plans based on patient history and best practices
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-3xl mb-4 text-center">🔍</div>
            <h3 className="font-semibold mb-2 text-center">Quality Assurance</h3>
            <p className="text-sm text-muted-foreground text-center">
              Automated review for completeness and compliance requirements
            </p>
          </Card>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Key Features:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li>• HIPAA-compliant transcription</li>
              <li>• Automated SOAP note generation</li>
              <li>• Treatment plan suggestions</li>
              <li>• Progress tracking integration</li>
            </ul>
            <ul className="space-y-2">
              <li>• Multi-language support</li>
              <li>• Custom template creation</li>
              <li>• Real-time collaboration</li>
              <li>• Audit trail maintenance</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Compliance & Regulatory Automation",
    subtitle: "Ensuring Adherence to Healthcare Standards",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📊 Compliance Monitoring</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Real-time compliance scoring</li>
                <li>• Automated policy updates</li>
                <li>• Risk assessment alerts</li>
                <li>• Corrective action tracking</li>
                <li>• Staff training reminders</li>
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📋 Regulatory Reporting</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Automated report generation</li>
                <li>• Multi-agency submissions</li>
                <li>• Deadline tracking</li>
                <li>• Data validation checks</li>
                <li>• Audit preparation tools</li>
              </ul>
            </Card>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Supported Standards:</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Badge variant="outline" className="justify-center py-2">HIPAA</Badge>
            <Badge variant="outline" className="justify-center py-2">Joint Commission</Badge>
            <Badge variant="outline" className="justify-center py-2">CMS</Badge>
            <Badge variant="outline" className="justify-center py-2">State Regulations</Badge>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "Revenue Cycle Optimization",
    subtitle: "AI-Powered Financial Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="font-semibold mb-2">Insurance Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time eligibility checks and benefit verification
            </p>
            <Badge variant="secondary">95% Accuracy</Badge>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📄</div>
            <h3 className="font-semibold mb-2">Claims Processing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Automated claim generation and submission
            </p>
            <Badge variant="secondary">50% Faster</Badge>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="font-semibold mb-2">Payment Tracking</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Intelligent follow-up and collections management
            </p>
            <Badge variant="secondary">30% Increase</Badge>
          </Card>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-green-900">Financial Impact:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Revenue Improvements</h4>
              <ul className="space-y-1 text-sm">
                <li>• 25% reduction in claim denials</li>
                <li>• 40% faster payment collection</li>
                <li>• 15% increase in clean claim rate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cost Reductions</h4>
              <ul className="space-y-1 text-sm">
                <li>• 60% reduction in billing staff time</li>
                <li>• 80% decrease in manual errors</li>
                <li>• 50% lower administrative costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Staff Productivity Enhancement",
    subtitle: "Empowering Healthcare Teams with AI",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">⏰ Time Savings</h3>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Administrative Tasks</span>
                  <Badge variant="secondary">-60%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Documentation Time</span>
                  <Badge variant="secondary">-45%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Patient Intake</span>
                  <Badge variant="secondary">-75%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Compliance Reporting</span>
                  <Badge variant="secondary">-80%</Badge>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📈 Productivity Gains</h3>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Patient Care Time</span>
                  <Badge variant="outline" className="text-green-600">+40%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Treatment Planning</span>
                  <Badge variant="outline" className="text-green-600">+35%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Staff Satisfaction</span>
                  <Badge variant="outline" className="text-green-600">+50%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Patient Throughput</span>
                  <Badge variant="outline" className="text-green-600">+25%</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="text-center">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold mb-4">Staff Feedback</h3>
            <p className="text-lg italic text-muted-foreground">
              "AI automation has transformed our daily workflow. We can now focus on what matters most - our patients."
            </p>
            <p className="text-sm mt-2 text-muted-foreground">- Clinical Director, Sunrise Treatment Center</p>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "Implementation Roadmap",
    subtitle: "90-Day Deployment Strategy",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold">Phase 1: Foundation</h3>
              <p className="text-sm text-muted-foreground">Days 1-30</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• System assessment</li>
              <li>• Data migration planning</li>
              <li>• Staff training preparation</li>
              <li>• Infrastructure setup</li>
              <li>• Security configuration</li>
            </ul>
          </Card>
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold">Phase 2: Deployment</h3>
              <p className="text-sm text-muted-foreground">Days 31-60</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Core AI agents activation</li>
              <li>• Workflow integration</li>
              <li>• Staff training sessions</li>
              <li>• Pilot testing</li>
              <li>• Performance monitoring</li>
            </ul>
          </Card>
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold">Phase 3: Optimization</h3>
              <p className="text-sm text-muted-foreground">Days 61-90</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Full system rollout</li>
              <li>• Advanced features activation</li>
              <li>• Performance optimization</li>
              <li>• User feedback integration</li>
              <li>• Success measurement</li>
            </ul>
          </Card>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Success Milestones:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li>✅ 100% staff trained and certified</li>
              <li>✅ 95% system uptime achieved</li>
              <li>✅ 50% reduction in processing time</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ Full compliance integration</li>
              <li>✅ ROI targets met or exceeded</li>
              <li>✅ Staff satisfaction > 85%</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 12,
    title: "Training & Support Program",
    subtitle: "Comprehensive Learning and Development",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📚 Training Modules</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">AI Fundamentals</h4>
                <p className="text-sm text-muted-foreground">Understanding AI capabilities and limitations</p>
                <Badge variant="outline" className="mt-2">2 hours</Badge>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">System Navigation</h4>
                <p className="text-sm text-muted-foreground">Hands-on platform training and workflows</p>
                <Badge variant="outline" className="mt-2">4 hours</Badge>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Advanced Features</h4>
                <p className="text-sm text-muted-foreground">Customization and optimization techniques</p>
                <Badge variant="outline" className="mt-2">3 hours</Badge>
              </Card>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🎯 Support Levels</h3>
            <div className="space-y-3">
              <Card className="p-4 border-green-200">
                <h4 className="font-semibold mb-2 text-green-700">24/7 Technical Support</h4>
                <p className="text-sm text-muted-foreground">Round-the-clock assistance for critical issues</p>
              </Card>
              <Card className="p-4 border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-700">Dedicated Success Manager</h4>
                <p className="text-sm text-muted-foreground">Personal guidance and optimization support</p>
              </Card>
              <Card className="p-4 border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-700">Community Forum</h4>
                <p className="text-sm text-muted-foreground">Peer-to-peer learning and best practices</p>
              </Card>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Training Outcomes:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <p className="text-sm text-muted-foreground">Staff Certification Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">4.8/5</div>
              <p className="text-sm text-muted-foreground">Training Satisfaction</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">2 weeks</div>
              <p className="text-sm text-muted-foreground">Average Proficiency Time</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 13,
    title: "Security & Privacy Framework",
    subtitle: "HIPAA-Compliant AI Infrastructure",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🔒 Security Measures</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• End-to-end encryption (AES-256)</li>
                <li>• Multi-factor authentication</li>
                <li>• Role-based access control</li>
                <li>• Regular security audits</li>
                <li>• Intrusion detection systems</li>
                <li>• Automated backup systems</li>
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🛡️ Privacy Protection</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• HIPAA compliance certification</li>
                <li>• Data anonymization protocols</li>
                <li>• Audit trail maintenance</li>
                <li>• Patient consent management</li>
                <li>• Data retention policies</li>
                <li>• Breach notification systems</li>
              </ul>
            </Card>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center border-green-200">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
            <p className="text-sm text-muted-foreground">Certified security controls</p>
          </Card>
          <Card className="p-6 text-center border-blue-200">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="font-semibold mb-2">HITRUST CSF</h3>
            <p className="text-sm text-muted-foreground">Healthcare security framework</p>
          </Card>
          <Card className="p-6 text-center border-purple-200">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="font-semibold mb-2">BAA Ready</h3>
            <p className="text-sm text-muted-foreground">Business Associate Agreement</p>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 14,
    title: "Integration Capabilities",
    subtitle: "Seamless EHR and System Connectivity",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-4">Supported Integrations</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🏥</div>
              <h4 className="font-semibold">Epic</h4>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold">Cerner</h4>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">💻</div>
              <h4 className="font-semibold">Allscripts</h4>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-semibold">Custom APIs</h4>
            </Card>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📡 Data Exchange</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• HL7 FHIR compliance</li>
                <li>• Real-time data synchronization</li>
                <li>• Bidirectional communication</li>
                <li>• Custom field mapping</li>
                <li>• Error handling & recovery</li>
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">⚙️ Implementation</h3>
            <Card className="p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Pre-built connectors</li>
                <li>• Configuration wizards</li>
                <li>• Testing environments</li>
                <li>• Migration tools</li>
                <li>• Rollback capabilities</li>
              </ul>
            </Card>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Integration Benefits:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime Guarantee</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">&lt;100ms</div>
              <p className="text-sm text-muted-foreground">Response Time</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Zero</div>
              <p className="text-sm text-muted-foreground">Data Loss</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 15,
    title: "Performance Metrics & KPIs",
    subtitle: "Measuring Success and ROI",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">📊 Operational Metrics</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Patient Intake Time</span>
                  <Badge variant="secondary">-75%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  From 3 hours to 45 minutes average
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Documentation Accuracy</span>
                  <Badge variant="secondary">95%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Significant improvement from 78%
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Compliance Score</span>
                  <Badge variant="secondary">98%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Consistent regulatory adherence
                </div>
              </Card>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">💰 Financial Impact</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Revenue Increase</span>
                  <Badge variant="outline" className="text-green-600">+25%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Through improved efficiency
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Cost Reduction</span>
                  <Badge variant="outline" className="text-green-600">-40%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Administrative overhead savings
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">ROI Achievement</span>
                  <Badge variant="outline" className="text-green-600">300%</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Within first 12 months
                </div>
              </Card>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Real-Time Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            Monitor all key metrics through our comprehensive analytics platform
          </p>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded">
              <div className="text-lg font-bold text-blue-600">Live</div>
              <p className="text-xs text-muted-foreground">Data Updates</p>
            </div>
            <div className="bg-white p-3 rounded">
              <div className="text-lg font-bold text-green-600">Custom</div>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
            <div className="bg-white p-3 rounded">
              <div className="text-lg font-bold text-purple-600">Alerts</div>
              <p className="text-xs text-muted-foreground">Notifications</p>
            </div>
            <div className="bg-white p-3 rounded">
              <div className="text-lg font-bold text-orange-600">Trends</div>
              <p className="text-xs text-muted-foreground">Analysis</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 16,
    title: "Case Study: Sunrise Treatment Center",
    subtitle: "Real-World Implementation Success",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-2">Client Profile</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold">Facility Size:</p>
              <p className="text-muted-foreground">120-bed residential center</p>
            </div>
            <div>
              <p className="font-semibold">Staff Count:</p>
              <p className="text-muted-foreground">85 healthcare professionals</p>
            </div>
            <div>
              <p className="font-semibold">Patient Volume:</p>
              <p className="text-muted-foreground">300+ admissions/month</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-destructive">❌ Before Implementation</h3>
            <Card className="p-4 border-destructive">
              <ul className="space-y-2 text-muted-foreground">
                <li>• 4-hour average intake process</li>
                <li>• 30% documentation errors</li>
                <li>• 15% compliance violations</li>
                <li>• $2.3M annual admin costs</li>
                <li>• 65% staff satisfaction</li>
                <li>• 25-day average claim processing</li>
              </ul>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-600">✅ After Implementation</h3>
            <Card className="p-4 border-green-500">
              <ul className="space-y-2 text-muted-foreground">
                <li>• 45-minute average intake process</li>
                <li>• 5% documentation errors</li>
                <li>• 2% compliance violations</li>
                <li>• $1.4M annual admin costs</li>
                <li>• 92% staff satisfaction</li>
                <li>• 8-day average claim processing</li>
              </ul>
            </Card>
          </div>
        </div>
        <div className="text-center">
          <Card className="p-6 bg-green-50">
            <h3 className="text-xl font-semibold mb-4 text-green-900">Results Summary</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-600">$900K</div>
                <p className="text-sm text-muted-foreground">Annual Savings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">89%</div>
                <p className="text-sm text-muted-foreground">Time Reduction</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">350%</div>
                <p className="text-sm text-muted-foreground">ROI Achieved</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 17,
    title: "Pricing & Investment Options",
    subtitle: "Flexible Plans for Every Treatment Center",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Starter</h3>
              <div className="text-3xl font-bold text-blue-600 my-2">$2,500</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✅ Up to 50 patients</li>
              <li>✅ Core AI agents</li>
              <li>✅ Basic integrations</li>
              <li>✅ Email support</li>
              <li>✅ Standard training</li>
            </ul>
            <Button className="w-full">Get Started</Button>
          </Card>
          <Card className="p-6 border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary">Most Popular</Badge>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Professional</h3>
              <div className="text-3xl font-bold text-green-600 my-2">$5,000</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✅ Up to 200 patients</li>
              <li>✅ All AI agents</li>
              <li>✅ Advanced integrations</li>
              <li>✅ 24/7 phone support</li>
              <li>✅ Premium training</li>
              <li>✅ Custom workflows</li>
            </ul>
            <Button className="w-full">Choose Professional</Button>
          </Card>
          <Card className="p-6 border-2">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <div className="text-3xl font-bold text-purple-600 my-2">Custom</div>
              <p className="text-sm text-muted-foreground">pricing</p>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li>✅ Unlimited patients</li>
              <li>✅ Custom AI development</li>
              <li>✅ White-label options</li>
              <li>✅ Dedicated support team</li>
              <li>✅ On-site training</li>
              <li>✅ SLA guarantees</li>
            </ul>
            <Button className="w-full" variant="outline">Contact Sales</Button>
          </Card>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Investment Benefits:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-2">
              <li>✅ No upfront hardware costs</li>
              <li>✅ Scalable monthly pricing</li>
              <li>✅ 30-day money-back guarantee</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ Free implementation support</li>
              <li>✅ Regular feature updates</li>
              <li>✅ Transparent pricing model</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 18,
    title: "Risk Mitigation & Contingency",
    subtitle: "Ensuring Smooth Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">⚠️ Potential Risks</h3>
            <div className="space-y-3">
              <Card className="p-4 border-orange-200">
                <h4 className="font-semibold text-orange-700">Staff Resistance</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Change management challenges
                </p>
              </Card>
              <Card className="p-4 border-red-200">
                <h4 className="font-semibold text-red-700">Integration Issues</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Technical compatibility concerns
                </p>
              </Card>
              <Card className="p-4 border-yellow-200">
                <h4 className="font-semibold text-yellow-700">Data Migration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Legacy system data transfer
                </p>
              </Card>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">🛡️ Mitigation Strategies</h3>
            <div className="space-y-3">
              <Card className="p-4 border-green-200">
                <h4 className="font-semibold text-green-700">Change Management</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive training and support
                </p>
              </Card>
              <Card className="p-4 border-blue-200">
                <h4 className="font-semibold text-blue-700">Technical Support</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Dedicated integration specialists
                </p>
              </Card>
              <Card className="p-4 border-purple-200">
                <h4 className="font-semibold text-purple-700">Data Protection</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Automated backup and validation
                </p>
              </Card>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Contingency Plans:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="font-semibold mb-1">Rollback Capability</h4>
              <p className="text-sm text-muted-foreground">Instant system restoration</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold mb-1">24/7 Emergency Support</h4>
              <p className="text-sm text-muted-foreground">Critical issue resolution</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💾</div>
              <h4 className="font-semibold mb-1">Data Recovery</h4>
              <p className="text-sm text-muted-foreground">Multiple backup systems</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 19,
    title: "Future Roadmap & Innovation",
    subtitle: "Continuous Evolution of AI Capabilities",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">🚀</span>
              </div>
              <h3 className="font-semibold">Q1 2024</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Predictive analytics engine</li>
              <li>• Advanced NLP capabilities</li>
              <li>• Mobile app integration</li>
              <li>• Voice command interface</li>
            </ul>
          </Card>
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">🔮</span>
              </div>
              <h3 className="font-semibold">Q2-Q3 2024</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Machine learning optimization</li>
              <li>• Telehealth integration</li>
              <li>• IoT device connectivity</li>
              <li>• Blockchain security</li>
            </ul>
          </Card>
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">🌟</span>
              </div>
              <h3 className="font-semibold">Q4 2024</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• AI-powered diagnostics</li>
              <li>• Virtual reality therapy</li>
              <li>• Genomic data integration</li>
              <li>• Global expansion features</li>
            </ul>
          </Card>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Innovation Commitment</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Research & Development</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 25% of revenue invested in R&D</li>
                <li>• Partnership with leading universities</li>
                <li>• Continuous AI model improvement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer-Driven Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Monthly feature request reviews</li>
                <li>• Beta testing programs</li>
                <li>• User feedback integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 20,
    title: "Call to Action",
    subtitle: "Transform Your Treatment Center Today",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🎯</div>
          </div>
          <h3 className="text-2xl font-bold">Ready to Revolutionize Your Operations?</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of treatment centers already benefiting from AI automation. 
            Start your transformation journey today with our comprehensive implementation program.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 text-center border-2 border-primary">
            <h3 className="text-xl font-semibold mb-4">Free Consultation</h3>
            <p className="text-muted-foreground mb-6">
              Schedule a personalized demo and assessment of your current systems
            </p>
            <Button size="lg" className="w-full">
              Book Your Demo
            </Button>
          </Card>
          <Card className="p-6 text-center border-2 border-green-500">
            <h3 className="text-xl font-semibold mb-4">30-Day Trial</h3>
            <p className="text-muted-foreground mb-6">
              Experience the full platform with no commitment and money-back guarantee
            </p>
            <Button size="lg" variant="outline" className="w-full border-green-500 text-green-600">
              Start Free Trial
            </Button>
          </Card>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Implementation Timeline</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">Week 1</div>
              <p className="text-sm text-muted-foreground">System Assessment</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">Week 4</div>
              <p className="text-sm text-muted-foreground">Go-Live Date</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Week 12</div>
              <p className="text-sm text-muted-foreground">Full Optimization</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Questions? Contact our experts:</p>
          <div className="flex justify-center space-x-6">
            <div>
              <p className="font-semibold">📞 Phone</p>
              <p className="text-muted-foreground">1-800-AI-HEALTH</p>
            </div>
            <div>
              <p className="font-semibold">✉️ Email</p>
              <p className="text-muted-foreground">solutions@aihealth.com</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 21,
    title: "Thank You",
    subtitle: "Questions & Discussion",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-bounce">
            <div className="text-4xl">🙏</div>
          </div>
          <h3 className="text-3xl font-bold">Thank You for Your Attention</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're excited to help transform your treatment center with AI automation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">📞 Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Sales:</span>
                <span className="text-muted-foreground">1-800-AI-HEALTH</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Support:</span>
                <span className="text-muted-foreground">support@aihealth.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Website:</span>
                <span className="text-muted-foreground">www.aihealth.com</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">🎁 Special Offer</h3>
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-green-600">20% Off First Year</p>
              <p className="text-muted-foreground">For implementations started within 30 days</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Code: TRANSFORM2024
              </Badge>
            </div>
          </Card>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold">Ready for Questions?</h3>
          <p className="text-lg text-muted-foreground">
            Let's discuss how AI can specifically benefit your treatment center
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">Schedule Follow-up</Button>
            <Button size="lg" variant="outline">Download Presentation</Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg text-center">
          <p className="text-lg font-semibold mb-2">🚀 Next Steps:</p>
          <p className="text-muted-foreground">
            Our team will follow up within 24 hours to discuss your specific needs and create a customized implementation plan
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
