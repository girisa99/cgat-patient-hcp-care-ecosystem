import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  defaultHealthcareServer,
  MCPUtils
} from '@/integrations/mcp/healthcare-server';
import { defaultFileSystemServer } from '@/integrations/mcp/filesystem-server';
import { Activity, FileText, Database, Shield, Cpu } from 'lucide-react';

const MCPDemoComponent: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <CardTitle>Tool Execution Result: {selectedTool}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(toolResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MCPDemoComponent;