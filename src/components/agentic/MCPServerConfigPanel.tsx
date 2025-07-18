import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Server, Database, Globe, Shield, Activity, Settings,
  Heart, CheckCircle, AlertCircle, Wifi, Zap, Brain, FileText,
  Search, Image, Code, MessageSquare, Calendar, Clock,
  BarChart3, Users, Lock, Key, Gauge
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  type: 'healthcare' | 'filesystem' | 'database' | 'api' | 'analytics' | 'security' | 'communication';
  capabilities: string[];
  description: string;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
  reliability: number;
  latency: number; // in ms
  supportedProtocols: string[];
  securityLevel: 'basic' | 'enhanced' | 'enterprise';
  dataTypes: string[];
  integrationComplexity: 'low' | 'medium' | 'high';
  useCases: string[];
  configuration?: {
    endpoint?: string;
    authentication?: string;
    rateLimit?: number;
    timeout?: number;
    customSettings?: Record<string, any>;
  };
}

interface MCPServerConfigPanelProps {
  selectedServerId: string;
  onServerSelect: (serverId: string) => void;
  onConfigurationChange: (serverId: string, config: any) => void;
  actionCategory?: string;
}

// Enhanced MCP Servers with more variety
const ENHANCED_MCP_SERVERS: MCPServer[] = [
  // Healthcare Specific
  {
    id: 'healthcare-master-server',
    name: 'Healthcare Master MCP Server',
    type: 'healthcare',
    capabilities: ['patient_data', 'clinical_workflows', 'compliance_check', 'hl7_processing', 'fhir_integration'],
    description: 'Comprehensive healthcare data management and clinical workflow automation',
    provider: 'HealthTech Solutions',
    status: 'active',
    reliability: 9.8,
    latency: 120,
    supportedProtocols: ['HL7', 'FHIR', 'DICOM', 'HTTP/2'],
    securityLevel: 'enterprise',
    dataTypes: ['patient_records', 'clinical_notes', 'lab_results', 'imaging_data'],
    integrationComplexity: 'high',
    useCases: ['Patient data aggregation', 'Clinical decision support', 'Compliance monitoring', 'Care coordination']
  },
  {
    id: 'clinical-nlp-server',
    name: 'Clinical NLP MCP Server',
    type: 'healthcare',
    capabilities: ['clinical_ner', 'icd_coding', 'medical_terminology', 'text_classification'],
    description: 'Specialized natural language processing for clinical text and medical documents',
    provider: 'MedNLP Systems',
    status: 'active',
    reliability: 9.5,
    latency: 80,
    supportedProtocols: ['REST', 'GraphQL', 'WebSocket'],
    securityLevel: 'enhanced',
    dataTypes: ['clinical_notes', 'discharge_summaries', 'radiology_reports'],
    integrationComplexity: 'medium',
    useCases: ['Clinical note analysis', 'ICD-10 coding', 'Medical entity extraction', 'Quality metrics']
  },

  // Filesystem & Document Management
  {
    id: 'enterprise-filesystem-server',
    name: 'Enterprise Filesystem MCP Server',
    type: 'filesystem',
    capabilities: ['file_operations', 'document_management', 'content_indexing', 'version_control', 'encryption'],
    description: 'Advanced file system operations with enterprise security and document management',
    provider: 'DocuFlow Systems',
    status: 'active',
    reliability: 9.6,
    latency: 50,
    supportedProtocols: ['HTTP/2', 'WebDAV', 'S3'],
    securityLevel: 'enterprise',
    dataTypes: ['documents', 'images', 'videos', 'archived_files'],
    integrationComplexity: 'low',
    useCases: ['Document workflow automation', 'Content management', 'File archival', 'Version control']
  },
  {
    id: 'medical-imaging-server',
    name: 'Medical Imaging MCP Server',
    type: 'filesystem',
    capabilities: ['dicom_processing', 'image_analysis', 'pacs_integration', 'ai_inference'],
    description: 'Specialized server for medical imaging workflows and DICOM processing',
    provider: 'ImageMed Solutions',
    status: 'active',
    reliability: 9.7,
    latency: 200,
    supportedProtocols: ['DICOM', 'HTTP/2', 'WebSocket'],
    securityLevel: 'enterprise',
    dataTypes: ['dicom_images', 'radiology_reports', 'study_metadata'],
    integrationComplexity: 'high',
    useCases: ['Radiology workflow', 'Image analysis', 'AI-assisted diagnosis', 'PACS integration']
  },

  // Database & Analytics
  {
    id: 'healthcare-analytics-server',
    name: 'Healthcare Analytics MCP Server',
    type: 'analytics',
    capabilities: ['data_aggregation', 'statistical_analysis', 'predictive_modeling', 'reporting'],
    description: 'Advanced analytics and business intelligence for healthcare data',
    provider: 'HealthAnalytics Pro',
    status: 'active',
    reliability: 9.4,
    latency: 150,
    supportedProtocols: ['SQL', 'GraphQL', 'REST'],
    securityLevel: 'enhanced',
    dataTypes: ['clinical_metrics', 'operational_data', 'financial_data'],
    integrationComplexity: 'medium',
    useCases: ['Population health analytics', 'Operational insights', 'Financial reporting', 'Quality metrics']
  },
  {
    id: 'real-time-database-server',
    name: 'Real-time Database MCP Server',
    type: 'database',
    capabilities: ['real_time_sync', 'nosql_operations', 'graph_queries', 'stream_processing'],
    description: 'High-performance database server with real-time synchronization capabilities',
    provider: 'DataStream Technologies',
    status: 'active',
    reliability: 9.3,
    latency: 25,
    supportedProtocols: ['WebSocket', 'GraphQL', 'MongoDB Wire Protocol'],
    securityLevel: 'enhanced',
    dataTypes: ['structured_data', 'time_series', 'graph_data'],
    integrationComplexity: 'medium',
    useCases: ['Real-time dashboards', 'Event streaming', 'Graph analytics', 'Time-series analysis']
  },

  // API & Integration
  {
    id: 'healthcare-api-gateway',
    name: 'Healthcare API Gateway MCP Server',
    type: 'api',
    capabilities: ['api_orchestration', 'rate_limiting', 'authentication', 'load_balancing'],
    description: 'Centralized API gateway for healthcare system integrations',
    provider: 'APIHealth Gateway',
    status: 'active',
    reliability: 9.9,
    latency: 45,
    supportedProtocols: ['REST', 'GraphQL', 'gRPC', 'WebSocket'],
    securityLevel: 'enterprise',
    dataTypes: ['api_requests', 'response_data', 'metrics'],
    integrationComplexity: 'low',
    useCases: ['API management', 'System integration', 'Rate limiting', 'Authentication']
  },
  {
    id: 'ehr-integration-server',
    name: 'EHR Integration MCP Server',
    type: 'api',
    capabilities: ['epic_integration', 'cerner_integration', 'allscripts_integration', 'data_mapping'],
    description: 'Specialized integration server for major EHR systems',
    provider: 'EHR Connect Solutions',
    status: 'active',
    reliability: 9.1,
    latency: 300,
    supportedProtocols: ['HL7', 'FHIR', 'REST', 'SOAP'],
    securityLevel: 'enterprise',
    dataTypes: ['ehr_data', 'patient_records', 'appointment_data'],
    integrationComplexity: 'high',
    useCases: ['EHR data synchronization', 'Cross-system communication', 'Data interoperability']
  },

  // Security & Compliance
  {
    id: 'healthcare-security-server',
    name: 'Healthcare Security MCP Server',
    type: 'security',
    capabilities: ['hipaa_compliance', 'audit_logging', 'encryption', 'access_control'],
    description: 'Comprehensive security and compliance monitoring for healthcare applications',
    provider: 'SecureHealth Systems',
    status: 'active',
    reliability: 9.8,
    latency: 60,
    supportedProtocols: ['TLS 1.3', 'OAuth 2.0', 'SAML'],
    securityLevel: 'enterprise',
    dataTypes: ['audit_logs', 'security_events', 'compliance_reports'],
    integrationComplexity: 'medium',
    useCases: ['HIPAA compliance monitoring', 'Security incident response', 'Access control', 'Audit trails']
  },

  // Communication
  {
    id: 'patient-communication-server',
    name: 'Patient Communication MCP Server',
    type: 'communication',
    capabilities: ['secure_messaging', 'appointment_scheduling', 'notification_delivery', 'telehealth'],
    description: 'Secure communication platform for patient-provider interactions',
    provider: 'PatientConnect Solutions',
    status: 'active',
    reliability: 9.2,
    latency: 100,
    supportedProtocols: ['WebSocket', 'WebRTC', 'SMS', 'Email'],
    securityLevel: 'enhanced',
    dataTypes: ['messages', 'appointments', 'notifications'],
    integrationComplexity: 'medium',
    useCases: ['Patient messaging', 'Appointment reminders', 'Telehealth sessions', 'Care team communication']
  }
];

export const MCPServerConfigPanel: React.FC<MCPServerConfigPanelProps> = ({
  selectedServerId,
  onServerSelect,
  onConfigurationChange,
  actionCategory
}) => {
  const [configTab, setConfigTab] = useState('servers');
  const [serverConfig, setServerConfig] = useState<Record<string, any>>({});

  const selectedServer = ENHANCED_MCP_SERVERS.find(s => s.id === selectedServerId);

  const getRecommendedServers = () => {
    switch (actionCategory) {
      case 'analysis':
        return ENHANCED_MCP_SERVERS.filter(s => 
          s.type === 'analytics' || 
          s.capabilities.includes('statistical_analysis')
        );
      case 'data_processing':
        return ENHANCED_MCP_SERVERS.filter(s => 
          s.type === 'filesystem' || 
          s.type === 'database'
        );
      case 'communication':
        return ENHANCED_MCP_SERVERS.filter(s => 
          s.type === 'communication' || 
          s.capabilities.includes('messaging')
        );
      case 'integration':
        return ENHANCED_MCP_SERVERS.filter(s => 
          s.type === 'api' || 
          s.capabilities.includes('integration')
        );
      default:
        return ENHANCED_MCP_SERVERS.filter(s => s.type === 'healthcare');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'healthcare': return <Heart className="h-4 w-4" />;
      case 'filesystem': return <FileText className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'maintenance': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSecurityBadgeColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'bg-green-100 text-green-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityBadgeColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateServerConfig = (serverId: string, key: string, value: any) => {
    const newConfig = {
      ...serverConfig,
      [serverId]: {
        ...serverConfig[serverId],
        [key]: value
      }
    };
    setServerConfig(newConfig);
    onConfigurationChange(serverId, newConfig[serverId]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          MCP Server Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={configTab} onValueChange={setConfigTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="servers">All Servers</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ENHANCED_MCP_SERVERS.map((server) => (
                  <Card
                    key={server.id}
                    className={`cursor-pointer transition-all ${
                      selectedServerId === server.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => onServerSelect(server.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(server.type)}
                            <h4 className="font-medium">{server.name}</h4>
                          </div>
                          <div className={`flex items-center gap-1 ${getStatusColor(server.status)}`}>
                            {getStatusIcon(server.status)}
                            <span className="text-xs capitalize">{server.status}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {server.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {server.provider}
                          </Badge>
                          <Badge className={getSecurityBadgeColor(server.securityLevel)}>
                            {server.securityLevel}
                          </Badge>
                          <Badge className={getComplexityBadgeColor(server.integrationComplexity)}>
                            {server.integrationComplexity} complexity
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            <span>Reliability: {server.reliability}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Latency: {server.latency}ms</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Capabilities:</Label>
                          <div className="flex flex-wrap gap-1">
                            {server.capabilities.slice(0, 3).map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability.replace('_', ' ')}
                              </Badge>
                            ))}
                            {server.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{server.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended for "{actionCategory}" actions</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getRecommendedServers().slice(0, 4).map((server) => (
                  <Card key={server.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(server.type)}
                            <h5 className="font-medium">{server.name}</h5>
                          </div>
                          <Badge className={getSecurityBadgeColor(server.securityLevel)}>
                            {server.securityLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {server.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Reliability: {server.reliability}/10
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onServerSelect(server.id)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            {selectedServer ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Configure: {selectedServer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize server settings and authentication
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      placeholder="https://api.example.com/v1"
                      value={serverConfig[selectedServer.id]?.endpoint || ''}
                      onChange={(e) => updateServerConfig(selectedServer.id, 'endpoint', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="auth-method">Authentication Method</Label>
                    <Select
                      value={serverConfig[selectedServer.id]?.authMethod || 'api_key'}
                      onValueChange={(value) => updateServerConfig(selectedServer.id, 'authMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        <SelectItem value="bearer_token">Bearer Token</SelectItem>
                        <SelectItem value="certificate">Client Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      placeholder="1000"
                      value={serverConfig[selectedServer.id]?.rateLimit || ''}
                      onChange={(e) => updateServerConfig(selectedServer.id, 'rateLimit', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      placeholder="30"
                      value={serverConfig[selectedServer.id]?.timeout || ''}
                      onChange={(e) => updateServerConfig(selectedServer.id, 'timeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key / Secret</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={serverConfig[selectedServer.id]?.apiKey || ''}
                    onChange={(e) => updateServerConfig(selectedServer.id, 'apiKey', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-headers">Custom Headers (JSON)</Label>
                  <Textarea
                    id="custom-headers"
                    placeholder='{"X-Custom-Header": "value"}'
                    value={serverConfig[selectedServer.id]?.customHeaders || ''}
                    onChange={(e) => updateServerConfig(selectedServer.id, 'customHeaders', e.target.value)}
                  />
                </div>

                {/* Server-specific configuration */}
                <div>
                  <Label className="text-sm font-medium">Supported Protocols:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedServer.supportedProtocols.map((protocol) => (
                      <Badge key={protocol} variant="outline" className="text-xs">
                        {protocol}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Data Types:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedServer.dataTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a server to configure</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            {selectedServer ? (
              <div className="space-y-4">
                <h4 className="font-medium">Server Health: {selectedServer.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <Label className="text-sm">Status</Label>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(selectedServer.status)}`}>
                        {getStatusIcon(selectedServer.status)}
                        <span className="font-medium capitalize">{selectedServer.status}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="h-4 w-4 text-blue-500" />
                        <Label className="text-sm">Reliability</Label>
                      </div>
                      <div className="font-medium">{selectedServer.reliability}/10</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <Label className="text-sm">Latency</Label>
                      </div>
                      <div className="font-medium">{selectedServer.latency}ms</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label className="text-sm font-medium">Use Cases:</Label>
                  <div className="mt-2 space-y-1">
                    {selectedServer.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a server to view monitoring</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};