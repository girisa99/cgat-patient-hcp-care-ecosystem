import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Bot, 
  User, 
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Users,
  Headphones,
  TestTube
} from 'lucide-react';
import { useAgentDeployments } from '@/hooks/useAgentDeployments';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { AgentChannelDeployment } from '@/types/agent-deployment';
import { toast } from '@/hooks/use-toast';

interface TestMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  channel?: string;
  metadata?: Record<string, any>;
}

interface TestSession {
  id: string;
  agentId: string;
  channelId: string;
  channelType: string;
  status: 'active' | 'completed' | 'transferred' | 'failed';
  messages: TestMessage[];
  startedAt: Date;
  endedAt?: Date;
  metrics: {
    responseTime: number;
    messageCount: number;
    transferRequests: number;
  };
}

export const AgentTestingInterface: React.FC = () => {
  const { deployments, loading: deploymentsLoading } = useAgentDeployments();
  const { createConversation, sendMessage } = useAgentConversations();
  
  const [selectedDeployment, setSelectedDeployment] = useState<AgentChannelDeployment | null>(null);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [liveAgentQueue, setLiveAgentQueue] = useState<any[]>([]);

  // Filter active deployments for testing
  const activeDeployments = deployments.filter(d => d.deployment_status === 'active');

  // Start a new test session
  const startTestSession = async (deployment: AgentChannelDeployment) => {
    try {
      const newSession: TestSession = {
        id: `test_${Date.now()}`,
        agentId: deployment.agent_id,
        channelId: deployment.channel_id,
        channelType: deployment.channel_type,
        status: 'active',
        messages: [],
        startedAt: new Date(),
        metrics: {
          responseTime: 0,
          messageCount: 0,
          transferRequests: 0,
        },
      };

      setTestSessions(prev => [...prev, newSession]);
      setActiveSession(newSession);
      setSelectedDeployment(deployment);

      // Add system message
      const systemMessage: TestMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `Test session started for agent on ${deployment.channel_type} channel`,
        timestamp: new Date(),
        channel: deployment.channel_id,
      };

      updateSessionMessages(newSession.id, systemMessage);

      toast({
        title: "Test Session Started",
        description: `Testing agent on ${deployment.channel_type} channel`,
      });
    } catch (error) {
      console.error('Error starting test session:', error);
      toast({
        title: "Test Failed",
        description: "Failed to start test session",
        variant: "destructive",
      });
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!activeSession || !messageInput.trim()) return;

    const userMessage: TestMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: messageInput.trim(),
      timestamp: new Date(),
      channel: activeSession.channelId,
    };

    updateSessionMessages(activeSession.id, userMessage);
    setMessageInput('');

    // Simulate agent response (in real implementation, this would call the actual agent)
    setTimeout(() => {
      const agentResponse: TestMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'agent',
        content: simulateAgentResponse(userMessage.content),
        timestamp: new Date(),
        channel: activeSession.channelId,
        metadata: {
          responseTime: Math.floor(Math.random() * 1000) + 500,
          confidence: Math.random() * 0.3 + 0.7,
        },
      };

      updateSessionMessages(activeSession.id, agentResponse);
      updateSessionMetrics(activeSession.id, agentResponse.metadata?.responseTime || 0);
    }, Math.floor(Math.random() * 2000) + 1000);
  };

  // Update session messages
  const updateSessionMessages = (sessionId: string, message: TestMessage) => {
    setTestSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: [...session.messages, message] }
        : session
    ));

    if (activeSession?.id === sessionId) {
      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
    }
  };

  // Update session metrics
  const updateSessionMetrics = (sessionId: string, responseTime: number) => {
    setTestSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            metrics: {
              ...session.metrics,
              responseTime: (session.metrics.responseTime + responseTime) / 2,
              messageCount: session.metrics.messageCount + 1,
            }
          }
        : session
    ));
  };

  // Simulate agent response
  const simulateAgentResponse = (userMessage: string): string => {
    const responses = [
      "I understand your request. Let me help you with that.",
      "Thank you for reaching out. I'm here to assist you.",
      "I can help you with this. Let me gather some information.",
      "That's a great question. Here's what I can tell you...",
      "I'm processing your request. Please give me a moment.",
    ];

    // Check if user is asking for something complex (trigger transfer scenario)
    if (userMessage.toLowerCase().includes('complex') || 
        userMessage.toLowerCase().includes('technical') ||
        userMessage.toLowerCase().includes('specialist')) {
      return "I understand this is a complex request that may require specialized assistance. Would you like me to transfer you to a live agent who can provide more detailed help?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Transfer to live agent
  const transferToLiveAgent = async () => {
    if (!activeSession) return;

    try {
      // Add transfer message
      const transferMessage: TestMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: 'Transferring conversation to live agent...',
        timestamp: new Date(),
        channel: activeSession.channelId,
      };

      updateSessionMessages(activeSession.id, transferMessage);

      // Update session status
      setActiveSession(prev => prev ? { ...prev, status: 'transferred' } : null);
      
      // Update metrics
      setTestSessions(prev => prev.map(session => 
        session.id === activeSession.id 
          ? { 
              ...session, 
              status: 'transferred',
              endedAt: new Date(),
              metrics: {
                ...session.metrics,
                transferRequests: session.metrics.transferRequests + 1,
              }
            }
          : session
      ));

      // Simulate adding to live agent queue
      const queueItem = {
        id: `queue_${Date.now()}`,
        sessionId: activeSession.id,
        agentId: activeSession.agentId,
        channelType: activeSession.channelType,
        waitTime: 0,
        priority: 'normal',
        timestamp: new Date(),
      };

      setLiveAgentQueue(prev => [...prev, queueItem]);

      toast({
        title: "Transfer Initiated",
        description: "Conversation has been transferred to live agent queue",
      });

      setIsTransferDialogOpen(false);
    } catch (error) {
      console.error('Error transferring to live agent:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer to live agent",
        variant: "destructive",
      });
    }
  };

  // End test session
  const endTestSession = () => {
    if (!activeSession) return;

    setActiveSession(prev => prev ? { ...prev, status: 'completed', endedAt: new Date() } : null);
    setTestSessions(prev => prev.map(session => 
      session.id === activeSession.id 
        ? { ...session, status: 'completed', endedAt: new Date() }
        : session
    ));

    toast({
      title: "Test Session Ended",
      description: "Test session completed successfully",
    });
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'voice-call': return Phone;
      case 'web-chat': return MessageSquare;
      case 'email': return Mail;
      case 'messaging': return MessageSquare;
      case 'voice-assistant': return Headphones;
      default: return MessageSquare;
    }
  };

  if (deploymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading deployments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agent Testing Interface</h2>
          <p className="text-muted-foreground">
            Test deployed agents across different channels and manage live agent transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/deployment-management'}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Go to Deployments
          </Button>
        </div>
      </div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="child-tabs">
          <TabsTrigger value="testing" className="child-tab-trigger">
            <TestTube className="h-4 w-4" />
            <span>Agent Testing</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="child-tab-trigger">
            <Clock className="h-4 w-4" />
            <span>Test Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="live-queue" className="child-tab-trigger">
            <Users className="h-4 w-4" />
            <span>Live Agent Queue</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="child-tab-content space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Deployments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Active Deployments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeDeployments.length > 0 ? (
                  activeDeployments.map((deployment) => {
                    const Icon = getChannelIcon(deployment.channel_type);
                    return (
                      <div
                        key={deployment.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                          selectedDeployment?.id === deployment.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedDeployment(deployment)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{deployment.channel_type}</span>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Priority: {deployment.priority}
                        </p>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            startTestSession(deployment);
                          }}
                        >
                          Start Test
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active deployments available for testing</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Test Conversation
                  </div>
                  {activeSession && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTransferDialogOpen(true)}
                        className="gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Transfer to Live Agent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={endTestSession}
                      >
                        End Test
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSession ? (
                  <div className="space-y-4">
                    {/* Session Info */}
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <Badge variant="secondary">{activeSession.channelType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Started: {activeSession.startedAt.toLocaleTimeString()}
                      </span>
                      <Badge 
                        variant={activeSession.status === 'active' ? 'default' : 'outline'}
                      >
                        {activeSession.status}
                      </Badge>
                    </div>

                    {/* Messages */}
                    <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                      {activeSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : message.type === 'system'
                                ? 'bg-muted text-muted-foreground text-center'
                                : 'bg-secondary'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.type === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : message.type === 'agent' ? (
                                <Bot className="h-4 w-4" />
                              ) : null}
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.metadata?.responseTime && (
                              <div className="text-xs opacity-70 mt-1">
                                Response time: {message.metadata.responseTime}ms
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your test message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                      />
                      <Button onClick={sendTestMessage} disabled={!messageInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Session Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{activeSession.metrics.messageCount}</p>
                        <p className="text-sm text-muted-foreground">Messages</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{Math.round(activeSession.metrics.responseTime)}ms</p>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{activeSession.metrics.transferRequests}</p>
                        <p className="text-sm text-muted-foreground">Transfers</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a deployment and start a test session</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="child-tab-content space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {testSessions.length > 0 ? (
                <div className="space-y-4">
                  {testSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.channelType}</Badge>
                          <Badge 
                            variant={session.status === 'active' ? 'default' : 'secondary'}
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {session.startedAt.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Messages:</span> {session.metrics.messageCount}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span> {Math.round(session.metrics.responseTime)}ms
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transfers:</span> {session.metrics.transferRequests}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span> {
                            session.endedAt 
                              ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000) + 's'
                              : 'Active'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No test sessions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-queue" className="child-tab-content space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Agent Transfer Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveAgentQueue.length > 0 ? (
                <div className="space-y-4">
                  {liveAgentQueue.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Transfer Request</Badge>
                          <Badge variant="secondary">{item.channelType}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Session:</span> {item.sessionId}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span> {item.priority}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wait Time:</span> {item.waitTime}s
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="default">
                          Assign Agent
                        </Button>
                        <Button size="sm" variant="outline">
                          Escalate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending transfer requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      {isTransferDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Transfer to Live Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to transfer this conversation to a live customer service agent?
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTransferDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={transferToLiveAgent}>
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};