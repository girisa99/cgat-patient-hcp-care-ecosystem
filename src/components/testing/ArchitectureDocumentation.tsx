import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye, Network, Database, Server, Layers, GitBranch, Shield } from 'lucide-react';

interface ArchitectureDocumentationProps {
  onDownload: (type: string) => void;
}

export function ArchitectureDocumentation({ onDownload }: ArchitectureDocumentationProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);

  const architectureDocs = [
    {
      id: 'high-level',
      title: 'High-Level Architecture',
      description: 'System overview and major component interactions',
      icon: Network,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'SVG'],
      details: {
        overview: 'Enterprise-level system architecture showing the complete healthcare testing framework',
        components: ['User Interface Layer', 'API Gateway', 'Business Logic', 'Data Layer', 'External Systems'],
        flows: ['Authentication Flow', 'Test Execution Flow', 'Data Processing Flow', 'Reporting Flow']
      }
    },
    {
      id: 'flow-diagrams',
      title: 'Flow & Process Diagrams',
      description: 'Detailed workflow and process flow documentation',
      icon: GitBranch,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'Visio'],
      details: {
        overview: 'Comprehensive process flows for all major system operations',
        components: ['Test Case Creation', 'Execution Pipeline', 'Result Processing', 'Compliance Validation'],
        flows: ['End-to-End Testing', 'CI/CD Integration', 'Error Handling', 'Data Synchronization']
      }
    },
    {
      id: 'low-level',
      title: 'Low-Level Architecture',
      description: 'Detailed technical implementation and component design',
      icon: Database,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'Word'],
      details: {
        overview: 'Deep technical dive into system internals and implementation details',
        components: ['Database Schema', 'API Endpoints', 'Service Classes', 'Utility Functions'],
        flows: ['Data Models', 'Service Interactions', 'Security Layers', 'Performance Optimizations']
      }
    },
    {
      id: 'reference',
      title: 'Reference Architecture',
      description: 'Standard patterns and best practices implementation',
      icon: Layers,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'PowerPoint'],
      details: {
        overview: 'Reference implementations and architectural patterns for healthcare testing',
        components: ['Design Patterns', 'Security Frameworks', 'Integration Patterns', 'Scalability Patterns'],
        flows: ['Best Practices', 'Security Guidelines', 'Performance Patterns', 'Compliance Frameworks']
      }
    },
    {
      id: 'security',
      title: 'Security Architecture',
      description: 'Security implementation and compliance framework',
      icon: Shield,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'Word'],
      details: {
        overview: 'Comprehensive security architecture for healthcare data protection',
        components: ['Authentication Layer', 'Authorization Framework', 'Data Encryption', 'Audit Trail'],
        flows: ['Security Protocols', 'Access Control', 'Data Protection', 'Compliance Monitoring']
      }
    },
    {
      id: 'deployment',
      title: 'Deployment Architecture',
      description: 'Infrastructure and deployment configuration',
      icon: Server,
      status: 'Complete',
      downloadTypes: ['PDF', 'PNG', 'YAML'],
      details: {
        overview: 'Cloud-native deployment architecture with scalability and reliability',
        components: ['Container Strategy', 'Load Balancing', 'Database Clustering', 'Monitoring Stack'],
        flows: ['Deployment Pipeline', 'Scaling Strategy', 'Disaster Recovery', 'Performance Monitoring']
      }
    }
  ];

  const ArchitectureDiagram = ({ type }: { type: string }) => {
    const diagramContent: Record<string, any> = {
      'high-level': (
        <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-lg font-semibold text-blue-600">Frontend Layer</div>
                <div className="text-sm text-gray-600">React + TypeScript</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-lg font-semibold text-green-600">API Gateway</div>
                <div className="text-sm text-gray-600">Supabase Edge Functions</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-lg font-semibold text-purple-600">Database</div>
                <div className="text-sm text-gray-600">PostgreSQL + RLS</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">High-Level System Architecture</div>
          </div>
        </div>
      ),
      'flow-diagrams': (
        <div className="w-full h-96 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 flex items-center justify-center">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-white p-3 rounded-lg shadow">Start</div>
              <div className="w-8 h-1 bg-gray-400"></div>
              <div className="bg-white p-3 rounded-lg shadow">Test Creation</div>
              <div className="w-8 h-1 bg-gray-400"></div>
              <div className="bg-white p-3 rounded-lg shadow">Execution</div>
              <div className="w-8 h-1 bg-gray-400"></div>
              <div className="bg-white p-3 rounded-lg shadow">Results</div>
            </div>
            <div className="text-center text-sm text-gray-500">Test Execution Flow</div>
          </div>
        </div>
      ),
      'low-level': (
        <div className="w-full h-96 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="font-semibold text-purple-600">Services Layer</div>
                <div className="text-xs space-y-1 mt-2">
                  <div>• Testing Service</div>
                  <div>• Validation Service</div>
                  <div>• Report Service</div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="font-semibold text-purple-600">Data Layer</div>
                <div className="text-xs space-y-1 mt-2">
                  <div>• Test Cases Table</div>
                  <div>• Execution History</div>
                  <div>• Compliance Reports</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="font-semibold text-purple-600">Hooks Layer</div>
                <div className="text-xs space-y-1 mt-2">
                  <div>• useUnifiedTesting</div>
                  <div>• useEnhancedTesting</div>
                  <div>• useComplianceReport</div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="font-semibold text-purple-600">Components</div>
                <div className="text-xs space-y-1 mt-2">
                  <div>• TestCasesDisplay</div>
                  <div>• ExecutionHistory</div>
                  <div>• ComplianceReports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    };

    return diagramContent[type] || (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Diagram for {type} will be rendered here</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Architecture Documentation</h3>
        <Button onClick={() => onDownload('architecture-complete')} className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {architectureDocs.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-6 w-6 text-primary" />
                  <Badge variant={doc.status === 'Complete' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                </div>
                <CardTitle className="text-base">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{doc.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Components:</div>
                  <div className="text-xs">
                    {doc.details.components.slice(0, 3).map((component, idx) => (
                      <div key={idx}>• {component}</div>
                    ))}
                    {doc.details.components.length > 3 && (
                      <div>... and {doc.details.components.length - 3} more</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          {doc.title}
                        </DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="diagram">Diagram</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4">
                          <div className="prose max-w-none">
                            <p>{doc.details.overview}</p>
                            <h4>Key Components:</h4>
                            <ul>
                              {doc.details.components.map((component, idx) => (
                                <li key={idx}>{component}</li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="diagram" className="space-y-4">
                          <ArchitectureDiagram type={doc.id} />
                          <div className="flex gap-2">
                            {doc.downloadTypes.map((type) => (
                              <Button 
                                key={type}
                                variant="outline" 
                                size="sm"
                                onClick={() => onDownload(`${doc.id}-${type.toLowerCase()}`)}
                              >
                                Download {type}
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Process Flows:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {doc.details.flows.map((flow, idx) => (
                                  <div key={idx} className="p-2 bg-muted rounded text-sm">
                                    {flow}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-1">
                    {doc.downloadTypes.map((type) => (
                      <Button 
                        key={type}
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDownload(`${doc.id}-${type.toLowerCase()}`)}
                        className="px-2"
                      >
                        {type}
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