import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, Network, Database, Server, Layers, GitBranch, Shield, FileText, Image, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EnhancedArchitectureDocumentationProps {
  onDownload: (type: string) => void;
}

export function EnhancedArchitectureDocumentation({ onDownload }: EnhancedArchitectureDocumentationProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const architectureDocs = [
    {
      id: 'high-level',
      title: 'High-Level Architecture',
      description: 'System overview and major component interactions',
      icon: Network,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Detailed PDF documentation' },
        { format: 'PNG', icon: Image, description: 'High-resolution diagram' },
        { format: 'Word', icon: File, description: 'Editable Word document' }
      ],
      details: {
        overview: 'Enterprise-level system architecture showing the complete healthcare testing framework with multi-tenant support, role-based access control, and scalable component architecture.',
        components: ['Frontend UI Layer (React/TypeScript)', 'API Gateway (Supabase Edge Functions)', 'Business Logic Layer', 'Database Layer (PostgreSQL with RLS)', 'External Integrations', 'Authentication & Authorization'],
        flows: ['User Authentication Flow', 'Test Execution Pipeline', 'Data Processing & Validation', 'Compliance Reporting', 'Multi-tenant Data Isolation'],
        technicalDetails: 'Built with React 18, TypeScript, Tailwind CSS, and Supabase. Implements design system patterns with semantic tokens for consistent theming across all tenants.'
      }
    },
    {
      id: 'low-level',
      title: 'Low-Level Architecture',
      description: 'Detailed technical implementation and component design',
      icon: Database,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Technical specification' },
        { format: 'PNG', icon: Image, description: 'Component diagrams' },
        { format: 'Word', icon: File, description: 'Implementation guide' }
      ],
      details: {
        overview: 'Deep technical implementation covering database schemas, API endpoints, service architecture, and component hierarchy with complete type safety.',
        components: ['Database Schema Design', 'RESTful API Endpoints', 'React Component Library', 'TypeScript Interfaces', 'Custom Hooks Architecture', 'Utility Functions'],
        flows: ['Data Model Relationships', 'Component State Management', 'API Request/Response Cycle', 'Error Handling Pipeline', 'Performance Optimization'],
        technicalDetails: 'Implements Domain-Driven Design principles with clear separation of concerns. All components are typed with TypeScript and follow design system patterns.'
      }
    },
    {
      id: 'security',
      title: 'Security Architecture',
      description: 'Security implementation and compliance framework',
      icon: Shield,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Security compliance report' },
        { format: 'PNG', icon: Image, description: 'Security flow diagrams' },
        { format: 'Word', icon: File, description: 'Security policies document' }
      ],
      details: {
        overview: 'Comprehensive security architecture implementing healthcare data protection standards with multi-layered security controls and audit capabilities.',
        components: ['Authentication Layer (Supabase Auth)', 'Authorization Framework (RBAC)', 'Data Encryption & Protection', 'Audit Trail System', 'Row Level Security (RLS)', 'API Security Controls'],
        flows: ['User Authentication Process', 'Permission Validation', 'Data Access Controls', 'Security Event Logging', 'Compliance Monitoring'],
        technicalDetails: 'HIPAA-compliant security measures with encryption at rest and in transit, comprehensive audit logging, and role-based access controls.'
      }
    },
    {
      id: 'reference',
      title: 'Reference Architecture',
      description: 'Standard patterns and best practices implementation',
      icon: Layers,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Best practices guide' },
        { format: 'PNG', icon: Image, description: 'Pattern diagrams' },
        { format: 'Word', icon: File, description: 'Implementation templates' }
      ],
      details: {
        overview: 'Reference implementations showcasing architectural patterns, design principles, and best practices for scalable healthcare applications.',
        components: ['Design Pattern Library', 'Component Architecture Patterns', 'Data Flow Patterns', 'Error Handling Patterns', 'Performance Optimization Patterns', 'Testing Strategies'],
        flows: ['Component Composition Patterns', 'State Management Flows', 'Data Synchronization', 'Error Recovery Procedures', 'Scaling Strategies'],
        technicalDetails: 'Implements enterprise-grade patterns including Singleton, Observer, Strategy, and Factory patterns with React-specific optimizations.'
      }
    },
    {
      id: 'flow-process',
      title: 'Flow & Process Architecture',
      description: 'Detailed workflow and process flow documentation',
      icon: GitBranch,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Process documentation' },
        { format: 'PNG', icon: Image, description: 'Workflow diagrams' },
        { format: 'Word', icon: File, description: 'Process procedures' }
      ],
      details: {
        overview: 'Comprehensive process flows covering all major system operations from user onboarding to test execution and compliance reporting.',
        components: ['User Journey Flows', 'Test Creation Process', 'Execution Pipeline', 'Result Processing', 'Compliance Validation', 'Report Generation'],
        flows: ['End-to-End Testing Workflow', 'User Onboarding Process', 'Data Import/Export', 'Compliance Audit Trail', 'Error Handling & Recovery'],
        technicalDetails: 'Automated workflows with built-in validation, error handling, and rollback capabilities. Supports both manual and automated test execution.'
      }
    },
    {
      id: 'deployment',
      title: 'Deployment Architecture',
      description: 'Infrastructure and deployment configuration',
      icon: Server,
      status: 'Complete',
      downloadTypes: [
        { format: 'PDF', icon: FileText, description: 'Deployment guide' },
        { format: 'PNG', icon: Image, description: 'Infrastructure diagrams' },
        { format: 'Word', icon: File, description: 'Configuration templates' }
      ],
      details: {
        overview: 'Cloud-native deployment architecture with auto-scaling, high availability, and disaster recovery capabilities.',
        components: ['Frontend Deployment (CDN)', 'Backend Services (Supabase)', 'Database Clustering', 'Load Balancing', 'Monitoring & Alerting', 'Backup & Recovery'],
        flows: ['CI/CD Pipeline', 'Auto-scaling Process', 'Disaster Recovery', 'Performance Monitoring', 'Security Scanning'],
        technicalDetails: 'Containerized deployment with Kubernetes orchestration, automated scaling policies, and comprehensive monitoring stack.'
      }
    }
  ];

  const generateDocument = async (docId: string, format: string) => {
    setIsGenerating(`${docId}-${format}`);
    
    try {
      const doc = architectureDocs.find(d => d.id === docId);
      if (!doc) {
        throw new Error('Document not found');
      }
      
      const fileName = `${doc.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      
      // Generate actual content based on format
      let content = '';
      let mimeType = '';
      let blob: Blob;
      
      if (format === 'PDF') {
        // Generate PDF content
        content = generatePDFContent(doc);
        mimeType = 'application/pdf';
        blob = new Blob([content], { type: mimeType });
      } else if (format === 'PNG') {
        // Generate PNG from diagram
        const canvas = await generateDiagramPNG(doc);
        blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
        mimeType = 'image/png';
      } else if (format === 'Word') {
        // Generate Word document
        content = generateWordContent(doc);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        blob = new Blob([content], { type: mimeType });
      } else {
        throw new Error('Unsupported format');
      }
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Document Downloaded",
        description: `${fileName} has been successfully downloaded.`,
      });
      
      onDownload(`${docId}-${format.toLowerCase()}`);
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "Generation Failed", 
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const generatePDFContent = (doc: any) => {
    // Simple text-based PDF content (would use a proper PDF library in production)
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 12 Tf
72 720 Td
(${doc.title}) Tj
0 -20 Td
(${doc.description}) Tj
0 -30 Td
(Overview: ${doc.details.overview}) Tj
0 -20 Td
(Components:) Tj
${doc.details.components.map((comp: string, i: number) => `0 -15 Td (${i + 1}. ${comp}) Tj`).join('\n')}
0 -30 Td
(Technical Details: ${doc.details.technicalDetails}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
735
%%EOF`;
  };

  const generateWordContent = (doc: any) => {
    // Simple HTML content that can be opened by Word
    return `<html>
<head>
<meta charset="utf-8">
<title>${doc.title}</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; }
h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
h2 { color: #1e40af; margin-top: 30px; }
ul { margin: 10px 0; }
li { margin: 5px 0; }
.overview { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
</style>
</head>
<body>
<h1>${doc.title}</h1>
<p><strong>Description:</strong> ${doc.description}</p>

<div class="overview">
<h2>Overview</h2>
<p>${doc.details.overview}</p>
</div>

<h2>Components</h2>
<ul>
${doc.details.components.map((comp: string) => `<li>${comp}</li>`).join('\n')}
</ul>

<h2>Process Flows</h2>
<ul>
${doc.details.flows.map((flow: string) => `<li>${flow}</li>`).join('\n')}
</ul>

<h2>Technical Details</h2>
<p>${doc.details.technicalDetails}</p>

<h2>Status</h2>
<p><strong>Current Status:</strong> ${doc.status}</p>
<p><strong>Document Generated:</strong> ${new Date().toLocaleString()}</p>
</body>
</html>`;
  };

  const generateDiagramPNG = async (doc: any): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(doc.title, 50, 50);
    
    // Draw description
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Arial';
    ctx.fillText(doc.description, 50, 90);
    
    // Draw components as boxes
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    
    let y = 150;
    doc.details.components.forEach((component: string, index: number) => {
      const boxHeight = 60;
      const boxWidth = 300;
      const x = 50 + (index % 3) * 350;
      
      if (index % 3 === 0 && index > 0) {
        y += 100;
      }
      
      // Draw box
      ctx.fillRect(x, y, boxWidth, boxHeight);
      ctx.strokeRect(x, y, boxWidth, boxHeight);
      
      // Draw text
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px Arial';
      const lines = component.match(/.{1,35}/g) || [component];
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + 10, y + 20 + lineIndex * 18);
      });
      
      ctx.fillStyle = '#f1f5f9';
    });
    
    // Add footer
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText(`Generated on ${new Date().toLocaleString()}`, 50, canvas.height - 30);
    
    return canvas;
  };

  const ArchitectureDiagram = ({ type }: { type: string }) => {
    const diagramContent: Record<string, any> = {
      'high-level': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="text-center space-y-6">
            <h4 className="text-lg font-semibold text-primary">System Architecture Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-4 rounded-lg shadow-md border">
                <div className="text-lg font-semibold text-primary mb-2">Frontend Layer</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• React 18 + TypeScript</div>
                  <div>• Tailwind CSS Design System</div>
                  <div>• Component-based Architecture</div>
                  <div>• Responsive Design</div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-md border">
                <div className="text-lg font-semibold text-primary mb-2">API Gateway</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Supabase Edge Functions</div>
                  <div>• RESTful API Design</div>
                  <div>• Authentication Middleware</div>
                  <div>• Rate Limiting</div>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-md border">
                <div className="text-lg font-semibold text-primary mb-2">Database Layer</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• PostgreSQL Database</div>
                  <div>• Row Level Security</div>
                  <div>• Multi-tenant Architecture</div>
                  <div>• Automated Backups</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-primary"></div>
                <span className="text-xs text-muted-foreground">Data Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-border"></div>
                <span className="text-xs text-muted-foreground">API Calls</span>
              </div>
            </div>
          </div>
        </div>
      ),
      'low-level': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Component Architecture</h4>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary">UI Components</div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• Shadcn/ui Base Components</div>
                  <div>• Custom Business Components</div>
                  <div>• Reusable Form Components</div>
                  <div>• Data Display Components</div>
                </div>
              </div>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary">Hooks & Services</div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• useEnhancedTesting</div>
                  <div>• useRoleBasedNavigation</div>
                  <div>• useSupabaseQuery</div>
                  <div>• Custom Business Logic Hooks</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Data Architecture</h4>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary">Database Schema</div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• User & Role Management</div>
                  <div>• Test Case Management</div>
                  <div>• Execution History</div>
                  <div>• Compliance Reports</div>
                </div>
              </div>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary">API Layer</div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• CRUD Operations</div>
                  <div>• Business Logic Functions</div>
                  <div>• Authentication Endpoints</div>
                  <div>• Report Generation APIs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      'security': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary text-center">Security Framework</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Authentication
                  </div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Supabase Auth Provider</div>
                    <div>• Multi-factor Authentication</div>
                    <div>• Session Management</div>
                    <div>• Token Validation</div>
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Data Protection</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Encryption at Rest</div>
                    <div>• TLS/SSL in Transit</div>
                    <div>• Field-level Encryption</div>
                    <div>• Secure Key Management</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Authorization</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Role-Based Access Control</div>
                    <div>• Permission Framework</div>
                    <div>• Row Level Security</div>
                    <div>• API Endpoint Protection</div>
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Audit & Compliance</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Activity Logging</div>
                    <div>• Change Tracking</div>
                    <div>• Security Event Monitoring</div>
                    <div>• Compliance Reporting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      'reference': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary text-center">Reference Patterns</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Design Patterns</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Component Composition</div>
                    <div>• Single Source of Truth</div>
                    <div>• Provider Pattern</div>
                    <div>• Custom Hook Pattern</div>
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Scalability Patterns</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Lazy Loading</div>
                    <div>• Code Splitting</div>
                    <div>• Memoization</div>
                    <div>• Virtual Scrolling</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Multi-tenant Architecture</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Tenant Isolation</div>
                    <div>• Shared Components</div>
                    <div>• Configuration Management</div>
                    <div>• Resource Optimization</div>
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg shadow border">
                  <div className="font-semibold text-primary">Performance Patterns</div>
                  <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                    <div>• Optimistic Updates</div>
                    <div>• Caching Strategies</div>
                    <div>• Batch Operations</div>
                    <div>• Error Boundaries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      'flow-process': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary text-center">Process Flow Architecture</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">User Login</div>
                  <div className="text-xs text-muted-foreground">Authentication</div>
                </div>
                <div className="w-8 h-1 bg-primary"></div>
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">Role Check</div>
                  <div className="text-xs text-muted-foreground">Authorization</div>
                </div>
                <div className="w-8 h-1 bg-primary"></div>
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">Module Access</div>
                  <div className="text-xs text-muted-foreground">Navigation</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">Test Creation</div>
                  <div className="text-xs text-muted-foreground">Test Setup</div>
                </div>
                <div className="w-8 h-1 bg-border"></div>
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">Execution</div>
                  <div className="text-xs text-muted-foreground">Test Run</div>
                </div>
                <div className="w-8 h-1 bg-border"></div>
                <div className="bg-card p-3 rounded-lg shadow border text-center">
                  <div className="font-semibold text-primary">Results</div>
                  <div className="text-xs text-muted-foreground">Reporting</div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Comprehensive workflow covering user authentication through test execution and reporting
            </div>
          </div>
        </div>
      ),
      'deployment': (
        <div className="w-full h-96 bg-gradient-to-br from-background to-muted rounded-lg p-6">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-primary text-center">Deployment Infrastructure</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Frontend
                </div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• Vite Build System</div>
                  <div>• CDN Distribution</div>
                  <div>• Static Asset Optimization</div>
                  <div>• Progressive Web App</div>
                </div>
              </div>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backend
                </div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• Supabase Cloud</div>
                  <div>• Edge Functions</div>
                  <div>• PostgreSQL Cluster</div>
                  <div>• Real-time Subscriptions</div>
                </div>
              </div>
              <div className="bg-card p-3 rounded-lg shadow border">
                <div className="font-semibold text-primary flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Infrastructure
                </div>
                <div className="text-xs space-y-1 mt-2 text-muted-foreground">
                  <div>• Load Balancing</div>
                  <div>• Auto-scaling</div>
                  <div>• Monitoring Stack</div>
                  <div>• Disaster Recovery</div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Cloud-native deployment with high availability and automatic scaling
            </div>
          </div>
        </div>
      )
    };

    return diagramContent[type] || (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Diagram for {type} will be rendered here</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-primary">Enhanced Architecture Documentation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive system architecture with downloadable documentation in multiple formats
          </p>
        </div>
        <Button onClick={() => onDownload('architecture-complete')} className="gap-2">
          <Download className="h-4 w-4" />
          Download Complete Suite
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {architectureDocs.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-7 w-7 text-primary" />
                  <Badge variant={doc.status === 'Complete' ? 'default' : 'secondary'} className="px-3">
                    {doc.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                
                <div className="space-y-3">
                  <div className="text-xs font-medium text-primary">Key Components:</div>
                  <div className="text-xs space-y-1">
                    {doc.details.components.slice(0, 3).map((component, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {component}
                      </div>
                    ))}
                    {doc.details.components.length > 3 && (
                      <div className="text-muted-foreground">
                        ... and {doc.details.components.length - 3} more components
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                          <IconComponent className="h-6 w-6 text-primary" />
                          {doc.title}
                        </DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="diagram">Diagram</TabsTrigger>
                          <TabsTrigger value="technical">Technical</TabsTrigger>
                          <TabsTrigger value="download">Download</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-6 mt-6">
                          <div className="prose max-w-none">
                            <h4 className="text-lg font-semibold text-primary">Architecture Overview</h4>
                            <p className="text-muted-foreground leading-relaxed">{doc.details.overview}</p>
                            
                            <h4 className="text-lg font-semibold text-primary mt-6">System Components</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {doc.details.components.map((component, idx) => (
                                <div key={idx} className="bg-muted p-3 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span className="font-medium">{component}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="diagram" className="space-y-6 mt-6">
                          <ArchitectureDiagram type={doc.id} />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {doc.downloadTypes.map((downloadType) => {
                              const TypeIcon = downloadType.icon;
                              return (
                                <Card key={downloadType.format} className="p-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <TypeIcon className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{downloadType.format}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    {downloadType.description}
                                  </p>
                                  <Button 
                                    size="sm" 
                                    className="w-full gap-2"
                                    onClick={() => generateDocument(doc.id, downloadType.format)}
                                    disabled={isGenerating === `${doc.id}-${downloadType.format}`}
                                  >
                                    {isGenerating === `${doc.id}-${downloadType.format}` ? (
                                      <>Generating...</>
                                    ) : (
                                      <>
                                        <Download className="h-3 w-3" />
                                        Download {downloadType.format}
                                      </>
                                    )}
                                  </Button>
                                </Card>
                              );
                            })}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="technical" className="space-y-6 mt-6">
                          <div>
                            <h4 className="text-lg font-semibold text-primary mb-4">Technical Implementation</h4>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                              {doc.details.technicalDetails}
                            </p>
                            
                            <h4 className="text-lg font-semibold text-primary mb-4">Process Flows</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {doc.details.flows.map((flow, idx) => (
                                <div key={idx} className="bg-card p-4 rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{flow}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="download" className="space-y-6 mt-6">
                          <div>
                            <h4 className="text-lg font-semibold text-primary mb-4">Available Downloads</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {doc.downloadTypes.map((downloadType) => {
                                const TypeIcon = downloadType.icon;
                                return (
                                  <Card key={downloadType.format} className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <TypeIcon className="h-8 w-8 text-primary" />
                                        <div>
                                          <h5 className="font-semibold">{downloadType.format} Format</h5>
                                          <p className="text-sm text-muted-foreground">
                                            {downloadType.description}
                                          </p>
                                        </div>
                                      </div>
                                      <Button 
                                        onClick={() => generateDocument(doc.id, downloadType.format)}
                                        disabled={isGenerating === `${doc.id}-${downloadType.format}`}
                                        className="gap-2"
                                      >
                                        {isGenerating === `${doc.id}-${downloadType.format}` ? (
                                          <>Generating...</>
                                        ) : (
                                          <>
                                            <Download className="h-4 w-4" />
                                            Download
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Quick Download:</div>
                  <div className="flex gap-1">
                    {doc.downloadTypes.map((downloadType) => (
                      <Button 
                        key={downloadType.format}
                        variant="ghost" 
                        size="sm"
                        onClick={() => generateDocument(doc.id, downloadType.format)}
                        disabled={isGenerating === `${doc.id}-${downloadType.format}`}
                        className="px-2 text-xs"
                      >
                        {downloadType.format}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}