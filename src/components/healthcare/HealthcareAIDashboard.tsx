import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, Shield, Activity, Database, Users, AlertTriangle } from 'lucide-react';
import { useHealthcareAI } from '@/hooks/useHealthcareAI';

const HealthcareAIDashboard: React.FC = () => {
  const {
    queryHealthcareAI,
    queryFacilities,
    queryClinicalTrials,
    checkComplianceStatus,
    getAPIIntegrations,
    getSecurityEvents,
    executeTestSuite,
    isLoading,
    lastResponse
  } = useHealthcareAI();

  const [aiQuery, setAiQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<'facility' | 'clinical' | 'compliance' | 'integration' | 'security' | 'general'>('general');
  const [mcpResults, setMcpResults] = useState<any>(null);

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    const response = await queryHealthcareAI({
      context: selectedContext,
      query: aiQuery,
      includeContext: ['facility', 'clinical', 'security']
    });

    console.log('AI Response:', response);
  };

  const handleMCPAction = async (action: string) => {
    try {
      let result;
      
      switch (action) {
        case 'facilities':
          result = await queryFacilities();
          break;
        case 'clinical-trials':
          result = await queryClinicalTrials();
          break;
        case 'compliance':
          result = await checkComplianceStatus();
          break;
        case 'api-integrations':
          result = await getAPIIntegrations();
          break;
        case 'security-events':
          result = await getSecurityEvents();
          break;
        case 'test-execution':
          result = await executeTestSuite('unit');
          break;
        default:
          return;
      }
      
      setMcpResults({ action, data: result });
    } catch (error) {
      console.error('MCP Action failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Healthcare AI & MCP Dashboard</h1>
      </div>

      <Tabs defaultValue="ai-query" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-query">AI Healthcare Query</TabsTrigger>
          <TabsTrigger value="mcp-operations">MCP Operations</TabsTrigger>
          <TabsTrigger value="results">Results & Context</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Healthcare AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about facilities, clinical trials, compliance, integrations, or security.
                Uses OpenAI GPT-4o-mini with healthcare context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="context">Healthcare Context</Label>
                <Select value={selectedContext} onValueChange={(value: any) => setSelectedContext(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select healthcare context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Healthcare</SelectItem>
                    <SelectItem value="facility">Facility Management</SelectItem>
                    <SelectItem value="clinical">Clinical Trials</SelectItem>
                    <SelectItem value="compliance">Compliance & Regulatory</SelectItem>
                    <SelectItem value="integration">API Integrations</SelectItem>
                    <SelectItem value="security">Security & Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">Your Healthcare Question</Label>
                <Textarea
                  id="query"
                  placeholder="e.g., 'What are the compliance requirements for our Phase II clinical trials?' or 'Show me facilities with pending onboarding status'"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleAIQuery} 
                disabled={isLoading || !aiQuery.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Healthcare Query...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Query Healthcare AI
                  </>
                )}
              </Button>

              {lastResponse && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">AI Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastResponse.success ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{lastResponse.response}</p>
                        </div>
                        {lastResponse.metadata && (
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{lastResponse.metadata.model}</Badge>
                            <Badge variant="outline">{lastResponse.context}</Badge>
                            <Badge variant="outline">{lastResponse.metadata.context_items} context items</Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm text-destructive">{lastResponse.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp-operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('facilities')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Query Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Retrieve healthcare facility data with MCP protocol
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('clinical-trials')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Clinical Trials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Access clinical trial information and status
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('compliance')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Check 21 CFR Part 11 and validation compliance
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('api-integrations')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  API Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Review active API integrations and status
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('security-events')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Monitor security events and audit logs
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMCPAction('test-execution')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  Execute Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Run comprehensive test suites for validation
                </p>
              </CardContent>
            </Card>
          </div>

          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Executing MCP operation...</span>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {mcpResults ? (
            <Card>
              <CardHeader>
                <CardTitle>MCP Operation Results: {mcpResults.action}</CardTitle>
                <CardDescription>
                  Results from Model Context Protocol operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(mcpResults.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No MCP results yet</p>
                  <p className="text-xs text-muted-foreground">
                    Execute an MCP operation to see results here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthcareAIDashboard;