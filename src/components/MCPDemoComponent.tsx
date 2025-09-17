import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  defaultHealthcareServer,
  MCPUtils
} from '@/integrations/mcp/healthcare-server';
import { defaultFileSystemServer } from '@/integrations/mcp/filesystem-server';
import { useConversationalEnrollment } from '@/hooks/useConversationalEnrollment';
import { Activity, FileText, Database, Shield, Cpu, Users, UserCheck } from 'lucide-react';

const MCPDemoComponent: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);
  const [isEnrollmentMode, setIsEnrollmentMode] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Integration with conversational enrollment
  const { 
    session, 
    isProcessing, 
    error, 
    startConversation, 
    processMessage, 
    endConversation 
  } = useConversationalEnrollment();

  const handleStartServer = async () => {
    setServerStatus('starting');
    try {
      await defaultHealthcareServer.start();
      await defaultFileSystemServer.start();
      setServerStatus('running');
    } catch (error) {
      console.error('Failed to start MCP servers:', error);
      setServerStatus('stopped');
    }
  };

  const handleStopServer = async () => {
    try {
      await defaultHealthcareServer.stop();
      await defaultFileSystemServer.stop();
      setServerStatus('stopped');
      setToolResult(null);
      setSelectedTool(null);
    } catch (error) {
      console.error('Failed to stop MCP servers:', error);
    }
  };

  const handleExecuteTool = async (toolName: string) => {
    setSelectedTool(toolName);
    try {
      let result;
      const sampleArgs = getSampleArgsForTool(toolName);
      
      if (toolName.includes('file')) {
        result = await defaultFileSystemServer.executeFileSystemTool(toolName, sampleArgs);
      } else {
        result = await defaultHealthcareServer.executeTool(toolName, sampleArgs);
      }
      
      setToolResult(MCPUtils.generateToolResponse(toolName, result));
    } catch (error) {
      setToolResult({ error: error.message });
    }
  };

  const handleStartEnrollmentConversation = async (moduleType: 'patient' | 'treatment_center') => {
    try {
      setIsEnrollmentMode(true);
      const sessionId = await startConversation(moduleType);
      console.log(`🎯 MCP initiated ${moduleType} enrollment conversation:`, sessionId);
      
      // Start with MCP educational conversation first
      const mcpWelcomeMessage = `🤖 Welcome! I'm your MCP-powered enrollment agent. 

Before we begin your ${moduleType} enrollment, let me share something exciting about the technology powering our conversation:

**What is MCP (Model Context Protocol)?**
MCP is a revolutionary standard that allows AI agents like me to seamlessly connect with various data sources, tools, and systems in real-time. Think of me as having superpowers - I can instantly access patient databases, verify NPI credentials, generate documents, and coordinate with multiple systems simultaneously.

**Why MCP is transforming healthcare:**
• **Real-time Intelligence**: I can verify your NPI, check credentialing status, and auto-fill forms instantly
• **Multi-System Integration**: I connect to databases, APIs, document generators, and communication channels all at once  
• **Contextual Awareness**: I remember our conversation and can reference any data point throughout the enrollment
• **Tool Orchestration**: I can trigger PDF generation, send SMS/WhatsApp notifications, and coordinate with voice agents

**The Evolution**: MCP is becoming the backbone of intelligent automation, enabling agents like me to be truly helpful rather than just conversational. We're moving from simple chatbots to intelligent assistants that can actually get work done.

Now, ready to experience this in action? I'll guide you through ${moduleType} enrollment while demonstrating these capabilities. What would you like to know about the enrollment process, or shall we dive right in?`;

      const response = await processMessage(mcpWelcomeMessage);
      
      setToolResult({
        tool: 'mcp-educational-conversation',
        status: 'educational-phase',
        sessionId,
        moduleType,
        message: response.response,
        phase: 'education',
        nextPhase: 'enrollment'
      });
    } catch (error) {
      console.error('Failed to start MCP conversation:', error);
      setToolResult({ error: error.message });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!session) return;
    
    try {
      // Check if user wants to proceed to enrollment
      const isReadyForEnrollment = message.toLowerCase().includes('dive right in') || 
                                   message.toLowerCase().includes('start enrollment') ||
                                   message.toLowerCase().includes('begin enrollment') ||
                                   message.toLowerCase().includes('ready') ||
                                   message.toLowerCase().includes('let\'s start');
      
      let contextualMessage = message;
      
      if (isReadyForEnrollment && toolResult?.phase === 'education') {
        contextualMessage = `Perfect! Let's transition to the actual ${session.moduleType} enrollment process. 

**🚀 MCP Powers Activated!**
Watch as I demonstrate real-time capabilities:
- Auto-detecting required fields for ${session.moduleType}
- Preparing NPI verification systems
- Setting up document generation workflows
- Initializing communication channels (SMS/WhatsApp/Email)

${message}

Now, let's start with the basics. What's the primary contact information for this ${session.moduleType} enrollment?`;

        // Update phase to enrollment
        setToolResult(prev => ({...prev, phase: 'enrollment'}));
      }
      
      const response = await processMessage(contextualMessage);
      
      // Enhance response with MCP context if in educational phase
      let enhancedResponse = response;
      if (toolResult?.phase === 'education' && !isReadyForEnrollment) {
        enhancedResponse = {
          ...response,
          response: response.response + `\n\n💡 **MCP Insight**: As we chat, I'm maintaining context about your ${session.moduleType} enrollment needs. When you're ready to begin, just say "let's start" and I'll demonstrate real-time data integration and intelligent form assistance!`
        };
      }
      
      setToolResult({
        tool: 'mcp-conversation',
        message: enhancedResponse.response,
        extractedData: enhancedResponse.extractedData,
        confidence: enhancedResponse.confidence,
        phase: isReadyForEnrollment ? 'enrollment' : (toolResult?.phase || 'education'),
        mcpCapabilities: {
          npiVerification: 'Ready',
          documentGeneration: 'Active',
          multiSystemIntegration: 'Connected',
          contextualMemory: 'Maintaining session data'
        }
      });
    } catch (error) {
      console.error('Failed to process message:', error);
      setToolResult({ error: error.message });
    }
  };

  const getSampleArgsForTool = (toolName: string) => {
    const sampleArgs: { [key: string]: any } = {
      'search-patient-records': {
        query: 'diabetes patient',
        facility_id: 'facility_001'
      },
      'clinical-decision-support': {
        patient_data: { age: 45, diagnosis: 'hypertension' },
        decision_type: 'treatment'
      },
      'compliance-audit': {
        audit_type: 'hipaa',
        scope: 'patient'
      },
      'read-patient-file': {
        file_path: '/healthcare-data/patient-records/patient_001.json',
        patient_id: 'patient_001'
      },
      'list-healthcare-files': {
        directory: '/clinical-documents/'
      }
    };
    return sampleArgs[toolName] || {};
  };

  const healthcareTools = defaultHealthcareServer.getTools();
  const fileSystemTools = defaultFileSystemServer.getFileSystemTools();
  const serverInfo = defaultHealthcareServer.getServerInfo();
  const fsServerInfo = defaultFileSystemServer.getFileSystemServerInfo();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Context Protocol (MCP) Healthcare Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Server Status:</span>
              <Badge variant={serverStatus === 'running' ? 'default' : 'secondary'}>
                {serverStatus === 'running' && <Activity className="h-3 w-3 mr-1" />}
                {serverStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {serverStatus === 'stopped' && (
                <Button onClick={handleStartServer}>Start MCP Servers</Button>
              )}
              {serverStatus === 'running' && (
                <Button variant="outline" onClick={handleStopServer}>Stop Servers</Button>
              )}
            </div>
          </div>

          {serverStatus === 'running' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Healthcare Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p><strong>Name:</strong> {serverInfo.name}</p>
                    <p><strong>Version:</strong> {serverInfo.version}</p>
                    <p><strong>Tools:</strong> {serverInfo.statistics.tools}</p>
                    <p><strong>Prompts:</strong> {serverInfo.statistics.prompts}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Filesystem Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p><strong>Mode:</strong> {fsServerInfo.filesystem.read_only ? 'Read-Only' : 'Read-Write'}</p>
                    <p><strong>Max File Size:</strong> {Math.round(fsServerInfo.filesystem.max_file_size / 1024 / 1024)}MB</p>
                    <p><strong>Protected Paths:</strong> {fsServerInfo.filesystem.allowed_paths.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {serverStatus === 'running' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleStartEnrollmentConversation('patient')}
                disabled={isProcessing}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Start Patient Enrollment
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleStartEnrollmentConversation('treatment_center')}
                disabled={isProcessing}
              >
                <Database className="h-4 w-4 mr-2" />
                Start Treatment Center Enrollment
              </Button>
              {session && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800">
                    Active Session: {session.moduleType}
                  </p>
                  <p className="text-xs text-green-600">
                    Current Section: {session.currentSection}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Healthcare Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {healthcareTools.slice(0, 3).map((tool) => (
                <Button
                  key={tool.name}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleExecuteTool(tool.name)}
                >
                  {tool.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Filesystem Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fileSystemTools.slice(0, 3).map((tool) => (
                <Button
                  key={tool.name}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleExecuteTool(tool.name)}
                >
                  {tool.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {toolResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEnrollmentMode ? 'Enrollment Conversation' : `Tool Execution Result: ${selectedTool}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEnrollmentMode && session ? (
              <div className="space-y-4">
                <div className={`p-4 rounded ${toolResult?.phase === 'education' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <h4 className={`font-medium ${toolResult?.phase === 'education' ? 'text-purple-800' : 'text-blue-800'}`}>
                    🤖 MCP Agent: {session.moduleType === 'patient' ? 'Patient' : 'Treatment Center'} {toolResult?.phase === 'education' ? 'Education' : 'Enrollment'}
                  </h4>
                  <p className={`text-sm mt-1 ${toolResult?.phase === 'education' ? 'text-purple-600' : 'text-blue-600'}`}>
                    Session ID: {session.sessionId}
                  </p>
                  <p className={`text-sm ${toolResult?.phase === 'education' ? 'text-purple-600' : 'text-blue-600'}`}>
                    Phase: {toolResult?.phase === 'education' ? '🎓 Learning about MCP' : `📋 ${session.currentSection}`}
                  </p>
                  {toolResult?.mcpCapabilities && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                       {Object.entries(toolResult.mcpCapabilities).map(([key, status]) => (
                         <div key={key} className="flex items-center gap-1">
                           <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                           <span className="text-xs text-gray-600">{key}: {String(status)}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <Label>
                    {toolResult?.phase === 'education' 
                      ? '💭 Continue the MCP conversation or say "let\'s start" to begin enrollment:' 
                      : '📝 Continue with enrollment details:'}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder={toolResult?.phase === 'education' 
                        ? "Ask about MCP benefits or say 'let's start'..." 
                        : "Provide enrollment information..."}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage(messageInput);
                          setMessageInput('');
                        }
                      }}
                      className="flex-1"
                    />
                    {toolResult?.phase === 'education' && (
                      <Button 
                        variant="default"
                        onClick={() => {
                          handleSendMessage("Let's dive right in and start the enrollment!");
                          setMessageInput('');
                        }}
                      >
                        Start Enrollment
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEnrollmentMode(false);
                        endConversation();
                      }}
                    >
                      End Session
                    </Button>
                  </div>
                  {toolResult?.phase === 'education' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleSendMessage("What makes MCP different from regular chatbots?");
                          setMessageInput('');
                        }}
                      >
                        MCP vs Chatbots?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleSendMessage("How does MCP help with healthcare enrollment specifically?");
                          setMessageInput('');
                        }}
                      >
                        Healthcare Benefits?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleSendMessage("What systems can you integrate with during enrollment?");
                          setMessageInput('');
                        }}
                      >
                        Integration Capabilities?
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(toolResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MCPDemoComponent;