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
      const mcpWelcomeMessage = `🤖 Welcome! I'm your advanced MCP-powered enrollment agent. 

Before we begin your ${moduleType} enrollment, let me briefly explain the intelligent technology driving our interaction:

**What is MCP (Model Context Protocol)?**
MCP is a revolutionary protocol that allows AI agents like me to connect with multiple systems simultaneously. I'm not just a chatbot - I'm an orchestrator of various specialized MCPs working together.

**Currently Active MCP Stack:**
🗄️ **Database MCP**: Real-time access to patient records, facility data, and enrollment histories 
🌐 **API MCP**: Integration with NPI registries, credentialing systems, and healthcare databases
🧠 **Memory MCP**: Contextual session memory that remembers our entire conversation
📄 **File MCP**: Document generation, PDF creation, and file management
🔄 **Hybrid MCP**: Intelligent routing between all systems for optimal performance

**How This Works For You:**
When you provide information, I simultaneously query multiple systems, cross-reference data, and prepare everything you need - all in real-time.

**Quick Options:**
- Want to learn more about how these MCPs work together? Ask me!
- Ready to start ${moduleType} enrollment? Just say "let's begin"
- Curious about specific MCP capabilities? I can explain any of them

What interests you most - the technology behind this, or shall we proceed with your enrollment?`;

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
                                   message.toLowerCase().includes('let\'s start') ||
                                   message.toLowerCase().includes('let\'s begin') ||
                                   message.toLowerCase().includes('proceed with');

      // Check if user wants to learn about specific MCP types or processes
      const mcpQuestions = {
        database: message.toLowerCase().includes('database mcp') || message.toLowerCase().includes('database'),
        api: message.toLowerCase().includes('api mcp') || message.toLowerCase().includes('api integration'),
        memory: message.toLowerCase().includes('memory mcp') || message.toLowerCase().includes('memory'),
        file: message.toLowerCase().includes('file mcp') || message.toLowerCase().includes('document'),
        hybrid: message.toLowerCase().includes('hybrid mcp') || message.toLowerCase().includes('hybrid'),
        process: message.toLowerCase().includes('how') && (message.toLowerCase().includes('work') || message.toLowerCase().includes('process')),
        technical: message.toLowerCase().includes('technical') || message.toLowerCase().includes('behind the scenes')
      };
      
      let contextualMessage = message;
      
      if (isReadyForEnrollment && toolResult?.phase === 'education') {
        contextualMessage = `Perfect! Let's transition to the actual ${session.moduleType} enrollment process. 

**🚀 All MCP Systems Activated!**
Watch as I demonstrate real-time multi-system orchestration:
- **Database MCP**: Querying ${session.moduleType} templates and requirements
- **API MCP**: Connecting to NPI verification and credentialing APIs  
- **Memory MCP**: Storing our conversation context for intelligent follow-ups
- **File MCP**: Preparing document generation pipelines
- **Hybrid MCP**: Optimizing data flow between all systems

${message}

Now, let's start with the basics. What's the primary contact information for this ${session.moduleType} enrollment?`;

        // Update phase to enrollment
        setToolResult(prev => ({...prev, phase: 'enrollment'}));
      } else if (Object.values(mcpQuestions).some(Boolean) && toolResult?.phase === 'education') {
        // Provide detailed MCP explanations based on what they asked about
        let mcpExplanation = "Great question! Let me explain:\n\n";
        
        if (mcpQuestions.database) {
          mcpExplanation += `**🗄️ Database MCP Deep Dive:**
- **Real-time Queries**: I query Supabase tables instantly (profiles, facilities, enrollment_instances)
- **Cross-referencing**: When you mention an NPI, I check against multiple tables simultaneously
- **Schema Awareness**: I understand table relationships and can navigate complex data structures
- **Row-Level Security**: All queries respect your permissions and data access rules
- **Live Updates**: Changes are reflected immediately across all connected systems

`;
        }
        
        if (mcpQuestions.api) {
          mcpExplanation += `**🌐 API MCP Deep Dive:**
- **NPI Registry**: Direct connection to NPPES for real-time provider verification
- **Credentialing APIs**: Integration with state licensing boards and certification systems
- **Healthcare APIs**: Connection to EHR systems, insurance networks, and medical databases
- **Rate Limiting**: Intelligent API call optimization to prevent throttling
- **Error Handling**: Graceful fallbacks when external APIs are unavailable

`;
        }
        
        if (mcpQuestions.memory) {
          mcpExplanation += `**🧠 Memory MCP Deep Dive:**
- **Session Context**: I remember everything we've discussed in this conversation
- **Cross-session Memory**: Can recall information from previous enrollment attempts
- **Intelligent Caching**: Frequently accessed data is cached for instant retrieval
- **Context Awareness**: I understand the relationship between different pieces of information
- **Progressive Enhancement**: Each interaction makes me smarter about your specific needs

`;
        }
        
        if (mcpQuestions.file) {
          mcpExplanation += `**📄 File MCP Deep Dive:**
- **PDF Generation**: Create enrollment documents, consent forms, and summaries on-demand
- **Template System**: Use pre-built templates that adapt based on your input
- **Document Assembly**: Combine data from multiple sources into cohesive documents
- **Version Control**: Track document changes and maintain audit trails
- **Multi-format Support**: Generate PDFs, Word docs, and other formats as needed

`;
        }
        
        if (mcpQuestions.hybrid) {
          mcpExplanation += `**🔄 Hybrid MCP Deep Dive:**
- **Intelligent Routing**: Automatically choose the best data source for each query
- **Load Balancing**: Distribute requests across multiple systems for optimal performance
- **Fallback Systems**: If one MCP fails, others seamlessly take over
- **Data Synthesis**: Combine information from multiple MCPs into unified responses
- **Performance Optimization**: Route queries to the fastest available system

`;
        }
        
        if (mcpQuestions.process || mcpQuestions.technical) {
          mcpExplanation += `**⚙️ How The MCP Process Works:**

1. **Input Processing**: When you send a message, I analyze it for entities (names, NPIs, dates)
2. **System Orchestration**: I simultaneously query relevant MCPs based on your input
3. **Data Correlation**: Information from different sources is cross-referenced and validated  
4. **Context Integration**: New data is merged with our conversation history
5. **Response Generation**: I craft responses that incorporate all relevant information
6. **Action Triggering**: If needed, I initiate workflows like document generation or notifications

**Behind the Scenes Right Now:**
- Database MCP is maintaining our session state
- Memory MCP is tracking our conversation flow  
- API MCP is ready to verify any credentials you provide
- File MCP is prepared to generate enrollment documents
- Hybrid MCP is optimizing performance across all systems

`;
        }
        
        mcpExplanation += `\n💡 **This gives you advantages like:**
- No need to repeat information - I remember everything
- Instant verification and validation of credentials
- Automated document generation with pre-filled data
- Seamless integration across all healthcare systems
- Intelligent error detection and correction

Want to see this in action with your ${session.moduleType} enrollment, or would you like to explore any other aspects of MCP technology?`;
        
        contextualMessage = mcpExplanation;
      }
      
      const response = await processMessage(contextualMessage);
      
      // Enhance response with MCP context if in educational phase
      let enhancedResponse = response;
      if (toolResult?.phase === 'education' && !isReadyForEnrollment && !Object.values(mcpQuestions).some(Boolean)) {
        enhancedResponse = {
          ...response,
          response: response.response + `\n\n💡 **Quick Navigation**:
- Ask "How do MCPs work together?" for technical details
- Say "Tell me about Database MCP" for data capabilities  
- Ask "What's the enrollment process?" to see it in action
- Or simply say "let's begin" to start your ${session.moduleType} enrollment!`
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
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("How do the different MCPs work together?");
                            setMessageInput('');
                          }}
                        >
                          MCP Process
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("Tell me about Database MCP capabilities");
                            setMessageInput('');
                          }}
                        >
                          Database MCP
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("Explain API MCP integration");
                            setMessageInput('');
                          }}
                        >
                          API MCP
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("How does Memory MCP work?");
                            setMessageInput('');
                          }}
                        >
                          Memory MCP
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("What can File MCP do?");
                            setMessageInput('');
                          }}
                        >
                          File MCP
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleSendMessage("Show me Hybrid MCP benefits");
                            setMessageInput('');
                          }}
                        >
                          Hybrid MCP
                        </Button>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            handleSendMessage("I understand the technology. Let's proceed with enrollment!");
                            setMessageInput('');
                          }}
                        >
                          🚀 Experience MCP in Action - Start Enrollment
                        </Button>
                      </div>
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