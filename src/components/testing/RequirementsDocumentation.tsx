import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Download, Eye, FileText, GitMerge, CheckCircle, AlertTriangle, Play } from 'lucide-react';

interface RequirementsDocumentationProps {
  onDownload: (type: string) => void;
}

export function RequirementsDocumentation({ onDownload }: RequirementsDocumentationProps) {
  const [animationActive, setAnimationActive] = useState<string | null>(null);

  const requirementsDocs = [
    {
      id: 'business-requirements',
      title: 'Business Requirements Specification',
      description: 'Comprehensive business requirements and stakeholder needs',
      icon: FileText,
      status: 'Complete',
      progress: 100,
      downloadTypes: ['PDF', 'Word', 'Excel'],
      animated: true,
      details: {
        overview: 'Complete business requirements specification for healthcare testing framework',
        sections: [
          'Stakeholder Analysis',
          'Business Objectives',
          'Functional Requirements',
          'Non-Functional Requirements',
          'Acceptance Criteria',
          'Risk Assessment'
        ],
        metrics: {
          totalRequirements: 156,
          implemented: 142,
          inProgress: 12,
          pending: 2
        }
      }
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      description: 'Detailed functional specifications and use cases',
      icon: CheckCircle,
      status: 'Complete',
      progress: 95,
      downloadTypes: ['PDF', 'Word', 'HTML'],
      animated: true,
      details: {
        overview: 'Detailed functional requirements covering all system capabilities',
        sections: [
          'User Management',
          'Test Case Management',
          'Execution Engine',
          'Reporting & Analytics',
          'Compliance Features',
          'Integration Capabilities'
        ],
        metrics: {
          totalRequirements: 89,
          implemented: 85,
          inProgress: 3,
          pending: 1
        }
      }
    },
    {
      id: 'traceability-matrix',
      title: 'Requirements Traceability Matrix',
      description: 'Mapping between requirements, tests, and implementation',
      icon: GitMerge,
      status: 'Complete',
      progress: 98,
      downloadTypes: ['Excel', 'CSV', 'PDF'],
      animated: true,
      details: {
        overview: 'Complete traceability from business requirements to test implementation',
        sections: [
          'Business-to-Functional Mapping',
          'Functional-to-Technical Mapping',
          'Requirements-to-Tests Mapping',
          'Test Coverage Analysis',
          'Implementation Status',
          'Validation Results'
        ],
        metrics: {
          totalMappings: 234,
          verified: 229,
          inProgress: 4,
          pending: 1
        }
      }
    },
    {
      id: 'compliance-reports',
      title: 'Compliance Reports',
      description: 'Regulatory compliance and validation documentation',
      icon: AlertTriangle,
      status: 'Complete',
      progress: 100,
      downloadTypes: ['PDF', 'Word', 'XML'],
      animated: false,
      details: {
        overview: 'Comprehensive compliance documentation for healthcare regulations',
        sections: [
          '21 CFR Part 11 Compliance',
          'HIPAA Compliance',
          'SOX Compliance',
          'Validation Documentation',
          'Audit Trail Reports',
          'Risk Assessment'
        ],
        metrics: {
          totalRequirements: 67,
          compliant: 65,
          inProgress: 2,
          pending: 0
        }
      }
    }
  ];

  const AnimatedProgress = ({ value, animated }: { value: number; animated: boolean }) => {
    const [currentValue, setCurrentValue] = useState(0);

    const startAnimation = () => {
      if (!animated) return;
      setCurrentValue(0);
      const timer = setInterval(() => {
        setCurrentValue(prev => {
          if (prev >= value) {
            clearInterval(timer);
            return value;
          }
          return prev + 2;
        });
      }, 20);
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completion Rate</span>
          <span>{animated ? currentValue : value}%</span>
        </div>
        <Progress value={animated ? currentValue : value} className="h-2" />
        {animated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={startAnimation}
            className="h-6 text-xs gap-1"
          >
            <Play className="h-3 w-3" />
            Animate
          </Button>
        )}
      </div>
    );
  };

  const RequirementsMatrix = ({ docId }: { docId: string }) => {
    const matrixData = {
      'business-requirements': [
        { id: 'BR-001', title: 'User Authentication', status: 'Implemented', tests: 12, coverage: 100 },
        { id: 'BR-002', title: 'Test Management', status: 'Implemented', tests: 25, coverage: 96 },
        { id: 'BR-003', title: 'Reporting Engine', status: 'In Progress', tests: 8, coverage: 65 },
        { id: 'BR-004', title: 'Compliance Tracking', status: 'Implemented', tests: 15, coverage: 100 }
      ],
      'functional-requirements': [
        { id: 'FR-001', title: 'Login Functionality', status: 'Implemented', tests: 8, coverage: 100 },
        { id: 'FR-002', title: 'Test Case Creation', status: 'Implemented', tests: 15, coverage: 100 },
        { id: 'FR-003', title: 'Test Execution', status: 'Implemented', tests: 20, coverage: 95 },
        { id: 'FR-004', title: 'Report Generation', status: 'In Progress', tests: 5, coverage: 60 }
      ],
      'traceability-matrix': [
        { id: 'TM-001', title: 'BR-001 → FR-001 → TC-001', status: 'Verified', tests: 8, coverage: 100 },
        { id: 'TM-002', title: 'BR-002 → FR-002 → TC-002', status: 'Verified', tests: 15, coverage: 100 },
        { id: 'TM-003', title: 'BR-003 → FR-003 → TC-003', status: 'Partial', tests: 10, coverage: 75 },
        { id: 'TM-004', title: 'BR-004 → FR-004 → TC-004', status: 'Verified', tests: 12, coverage: 100 }
      ],
      'compliance-reports': [
        { id: 'CR-001', title: '21 CFR Part 11 Electronic Records', status: 'Compliant', tests: 18, coverage: 100 },
        { id: 'CR-002', title: 'HIPAA Data Protection', status: 'Compliant', tests: 22, coverage: 100 },
        { id: 'CR-003', title: 'SOX Financial Controls', status: 'In Progress', tests: 8, coverage: 75 },
        { id: 'CR-004', title: 'Audit Trail Requirements', status: 'Compliant', tests: 14, coverage: 100 }
      ]
    };

    const data = matrixData[docId as keyof typeof matrixData] || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 p-3 bg-muted rounded-lg text-sm font-medium">
          <div>ID</div>
          <div>Requirement</div>
          <div>Status</div>
          <div>Tests</div>
          <div>Coverage</div>
        </div>
        {data.map((item, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2 p-3 border rounded-lg text-sm">
            <div className="font-mono text-xs">{item.id}</div>
            <div>{item.title}</div>
            <div>
              <Badge variant={item.status === 'Implemented' || item.status === 'Compliant' || item.status === 'Verified' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
            <div>{item.tests}</div>
            <div className="flex items-center gap-2">
              <span>{item.coverage}%</span>
              <div className="flex-1 h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${item.coverage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Requirements Documentation</h3>
        <Button onClick={() => onDownload('requirements-complete')} className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirementsDocs.map((doc) => {
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
                
                <AnimatedProgress value={doc.progress} animated={doc.animated} />

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">{doc.details.metrics.implemented || doc.details.metrics.compliant || doc.details.metrics.verified}</div>
                    <div className="text-green-600">Complete</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-700">{doc.details.metrics.inProgress}</div>
                    <div className="text-yellow-600">In Progress</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-700">{doc.details.metrics.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          {doc.title}
                        </DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="sections">Sections</TabsTrigger>
                          <TabsTrigger value="matrix">Requirements Matrix</TabsTrigger>
                          <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4">
                          <div className="prose max-w-none">
                            <p>{doc.details.overview}</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Document Status</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Completion:</span>
                                    <span className="font-semibold">{doc.progress}%</span>
                                  </div>
                                  <Progress value={doc.progress} />
                                </div>
                              </div>
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Available Formats</h4>
                                <div className="flex gap-2">
                                  {doc.downloadTypes.map((type) => (
                                    <Badge key={type} variant="outline">{type}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="sections" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {doc.details.sections.map((section, idx) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="font-medium">{section}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Section {idx + 1} of {doc.details.sections.length}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="matrix" className="space-y-4">
                          <RequirementsMatrix docId={doc.id} />
                        </TabsContent>
                        
                        <TabsContent value="metrics" className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Completion Metrics</h4>
                              <div className="space-y-3">
                                {Object.entries(doc.details.metrics).map(([key, value]) => (
                                  <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="font-semibold">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="font-medium">Download Options</h4>
                              <div className="space-y-2">
                                {doc.downloadTypes.map((type) => (
                                  <Button 
                                    key={type}
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onDownload(`${doc.id}-${type.toLowerCase()}`)}
                                    className="w-full gap-2"
                                  >
                                    <Download className="h-3 w-3" />
                                    Download {type}
                                  </Button>
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