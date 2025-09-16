/**
 * ENROLLMENT METHOD COMPARISON
 * Comprehensive comparison of all enrollment options including MCP integration
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Zap, 
  MessageCircle, 
  FileText, 
  Workflow,
  Database,
  Clock,
  Shield,
  Activity,
  Brain,
  Network
} from 'lucide-react';

interface EnrollmentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: { text: string; variant: 'default' | 'secondary' | 'outline'; color?: string };
  features: {
    mcpIntegration: boolean;
    realtimeUpdates: boolean;
    structuredConversation: boolean;
    stepwiseGuidance: boolean;
    aiAssistance: boolean;
    databaseSync: boolean;
    validationTools: boolean;
    pdfGeneration: boolean;
    digitalSignature: boolean;
    auditTrail: boolean;
  };
  estimatedTime: string;
  complexity: 'low' | 'medium' | 'high';
  dataAccuracy: 'standard' | 'enhanced' | 'superior';
  userExperience: 'basic' | 'good' | 'excellent';
  technicalRequirements: string[];
  idealFor: string[];
  limitations: string[];
}

const enrollmentMethods: EnrollmentMethod[] = [
  {
    id: 'mcp_stepwise',
    name: 'MCP Stepwise Agent',
    icon: Zap,
    description: 'Advanced MCP-powered stepwise enrollment with WhatsApp integration, NPI verification, and real-time database updates',
    badge: { text: 'RECOMMENDED', variant: 'default', color: 'bg-green-500' },
    features: {
      mcpIntegration: true,
      realtimeUpdates: true,
      structuredConversation: true,
      stepwiseGuidance: true,
      aiAssistance: true,
      databaseSync: true,
      validationTools: true,
      pdfGeneration: true,
      digitalSignature: true,
      auditTrail: true
    },
    estimatedTime: '3-5 minutes',
    complexity: 'high',
    dataAccuracy: 'superior',
    userExperience: 'excellent',
    technicalRequirements: [
      'MCP Server Integration',
      'WhatsApp Business API',
      'NPI Verification Service',
      'Real-time Database Connection',
      'AI Model Integration',
      'WebSocket Support'
    ],
    idealFor: [
      'Complex healthcare enrollments',
      'WhatsApp-enabled patient communication',
      'High-compliance requirements',
      'Real-time data validation needed',
      'Multi-step processes'
    ],
    limitations: [
      'Requires MCP server setup',
      'Higher technical complexity',
      'Dependent on AI availability'
    ]
  },
  {
    id: 'structured_ai',
    name: 'Structured AI',
    icon: Workflow,
    description: 'Section-by-section AI guidance with WhatsApp integration and specialized assistance for each enrollment step',
    badge: { text: 'EFFICIENT', variant: 'default', color: 'bg-blue-500' },
    features: {
      mcpIntegration: false,
      realtimeUpdates: true,
      structuredConversation: true,
      stepwiseGuidance: true,
      aiAssistance: true,
      databaseSync: true,
      validationTools: true,
      pdfGeneration: true,
      digitalSignature: true,
      auditTrail: true
    },
    estimatedTime: '6-10 minutes',
    complexity: 'medium',
    dataAccuracy: 'enhanced',
    userExperience: 'good',
    technicalRequirements: [
      'WhatsApp Business API',
      'NPI Verification Service',
      'AI Model Integration',
      'Database Connection',
      'Form Validation Logic'
    ],
    idealFor: [
      'Standard healthcare enrollments',
      'WhatsApp patient communication',
      'Users who prefer structured approach',
      'Step-by-step guidance needed'
    ],
    limitations: [
      'No full MCP integration',
      'Limited to basic AI assistance'
    ]
  },
  {
    id: 'conversational_ai',
    name: 'Conversational AI',
    icon: MessageCircle,
    description: 'Natural chat with WhatsApp integration, multiple AI personalities, and conversational enrollment flow',
    badge: { text: 'AI POWERED', variant: 'default', color: 'bg-purple-500' },
    features: {
      mcpIntegration: false,
      realtimeUpdates: true,
      structuredConversation: true,
      stepwiseGuidance: false,
      aiAssistance: true,
      databaseSync: true,
      validationTools: true,
      pdfGeneration: true,
      digitalSignature: true,
      auditTrail: false
    },
    estimatedTime: '5-10 minutes',
    complexity: 'medium',
    dataAccuracy: 'enhanced',
    userExperience: 'excellent',
    technicalRequirements: [
      'WhatsApp Business API',
      'AI Personality Models',
      'NPI Verification Service', 
      'AI Model Integration',
      'Conversation Management',
      'Data Extraction Logic'
    ],
    idealFor: [
      'Users comfortable with chat interfaces',
      'WhatsApp-preferred communication',
      'Natural conversation preference',
      'Flexible enrollment flow'
    ],
    limitations: [
      'Less structured than stepwise approach',
      'Dependent on AI understanding'
    ]
  },
  {
    id: 'traditional_forms',
    name: 'Traditional Forms',
    icon: FileText,
    description: 'Standard manual form interface with field-by-field data entry',
    badge: { text: 'CLASSIC', variant: 'outline' },
    features: {
      mcpIntegration: false,
      realtimeUpdates: false,
      structuredConversation: false,
      stepwiseGuidance: false,
      aiAssistance: false,
      databaseSync: true,
      validationTools: false,
      pdfGeneration: true,
      digitalSignature: true,
      auditTrail: false
    },
    estimatedTime: '15-20 minutes',
    complexity: 'low',
    dataAccuracy: 'standard',
    userExperience: 'basic',
    technicalRequirements: [
      'Form Validation',
      'Database Connection',
      'PDF Generation'
    ],
    idealFor: [
      'Users familiar with traditional forms',
      'Simple data entry needs',
      'No AI requirements'
    ],
    limitations: [
      'No AI assistance',
      'Manual data validation',
      'No real-time updates',
      'Longer completion time'
    ]
  }
];

export const EnrollmentMethodComparison: React.FC = () => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'standard': return 'text-gray-600 bg-gray-100';
      case 'enhanced': return 'text-blue-600 bg-blue-100';
      case 'superior': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'basic': return 'text-gray-600 bg-gray-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'excellent': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Enrollment Method Comparison</CardTitle>
          <p className="text-muted-foreground">
            Compare all available enrollment methods to choose the best approach for your needs
          </p>
        </CardHeader>
      </Card>

      {/* Method Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {enrollmentMethods.map((method) => (
          <Card key={method.id} className="relative">
            {method.badge && (
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={method.badge.variant}
                  className={method.badge.color ? method.badge.color : ''}
                >
                  {method.badge.text}
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {React.createElement(method.icon, { className: "h-6 w-6 text-primary" })}
                </div>
                <div>
                  <div className="font-semibold">{method.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {method.estimatedTime}
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {method.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`px-2 py-1 rounded text-center ${getComplexityColor(method.complexity)}`}>
                  {method.complexity.toUpperCase()}
                </div>
                <div className={`px-2 py-1 rounded text-center ${getAccuracyColor(method.dataAccuracy)}`}>
                  {method.dataAccuracy.toUpperCase()}
                </div>
                <div className={`px-2 py-1 rounded text-center ${getExperienceColor(method.userExperience)}`}>
                  {method.userExperience.toUpperCase()}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Features:</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(method.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-1">
                      {enabled ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={enabled ? '' : 'text-gray-400'}>
                        {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal For */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ideal For:</h4>
                <ul className="space-y-1">
                  {method.idealFor.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-start gap-1 text-xs">
                      <div className="h-1 w-1 bg-primary rounded-full mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">Limitations:</h4>
                <ul className="space-y-1">
                  {method.limitations.slice(0, 2).map((item, index) => (
                    <li key={index} className="flex items-start gap-1 text-xs text-red-600">
                      <div className="h-1 w-1 bg-red-500 rounded-full mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  {enrollmentMethods.map(method => (
                    <th key={method.id} className="text-center p-2">
                      {method.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(enrollmentMethods[0].features).map(feature => (
                  <tr key={feature} className="border-b">
                    <td className="p-2 font-medium">
                      {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </td>
                    {enrollmentMethods.map(method => (
                      <td key={method.id} className="text-center p-2">
                        {method.features[feature as keyof typeof method.features] ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Network className="h-4 w-4" />
                With MCP Integration
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>MCP Stepwise Agent</strong> provides the most comprehensive enrollment experience with:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Database className="h-3 w-3 text-blue-500" />
                    Real-time database synchronization
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-500" />
                    Live validation and error correction
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-3 w-3 text-purple-500" />
                    Advanced AI tool integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-red-500" />
                    Comprehensive audit trails
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Without MCP Integration
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Alternative approaches when MCP is not available:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Workflow className="h-3 w-3 text-blue-500" />
                    <strong>Structured AI:</strong> Best balance of guidance and simplicity
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="h-3 w-3 text-purple-500" />
                    <strong>Conversational AI:</strong> Natural interaction, flexible flow
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-gray-500" />
                    <strong>Traditional Forms:</strong> Familiar, reliable, basic functionality
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Recommendation</h4>
                <p className="text-blue-700 text-sm mt-1">
                  For optimal enrollment experience, implement MCP Stepwise Agent as the primary method with 
                  Structured AI as a fallback. This provides the best combination of advanced features while 
                  maintaining reliability when MCP services are unavailable.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};