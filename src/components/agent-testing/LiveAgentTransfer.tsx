import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Phone,
  MessageSquare,
  User,
  Zap,
  Filter,
  Plus,
  Edit,
  Power,
  PowerOff,
  Trash2
} from 'lucide-react';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { toast } from '@/hooks/use-toast';

interface TransferRequest {
  id: string;
  conversationId: string;
  agentId: string;
  channelType: string;
  reason: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'assigned' | 'completed' | 'escalated';
  requestedAt: Date;
  assignedTo?: string;
  assignedAt?: Date;
  metadata?: Record<string, any>;
}

interface LiveAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: string[];
  status: 'available' | 'busy' | 'away' | 'offline';
  currentLoad: number;
  maxCapacity: number;
  avgResponseTime: number;
}

export const LiveAgentTransfer: React.FC = () => {
  const { conversations, transferToLiveAgent } = useAgentConversations();
  
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [liveAgents, setLiveAgents] = useState<LiveAgent[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [transferReason, setTransferReason] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'assigned'>('all');
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showEditAgent, setShowEditAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<LiveAgent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    department: '',
    skills: [] as string[],
    maxCapacity: 5
  });

  // Mock live agents data
  useEffect(() => {
    const mockAgents: LiveAgent[] = [
      {
        id: 'agent_1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Customer Support',
        skills: ['General Support', 'Technical Issues', 'Billing'],
        status: 'available',
        currentLoad: 2,
        maxCapacity: 5,
        avgResponseTime: 45,
      },
      {
        id: 'agent_2',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        department: 'Technical Support',
        skills: ['Technical Issues', 'Product Setup', 'Troubleshooting'],
        status: 'busy',
        currentLoad: 4,
        maxCapacity: 4,
        avgResponseTime: 62,
      },
      {
        id: 'agent_3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        department: 'Escalations',
        skills: ['Complex Issues', 'Escalations', 'Management'],
        status: 'available',
        currentLoad: 1,
        maxCapacity: 3,
        avgResponseTime: 38,
      },
    ];
    setLiveAgents(mockAgents);
  }, []);

  // Filter transfer requests
  const filteredRequests = transferRequests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );

  // Create transfer request
  const createTransferRequest = async (
    conversationId: string,
    agentId: string,
    channelType: string
  ) => {
    const newRequest: TransferRequest = {
      id: `transfer_${Date.now()}`,
      conversationId,
      agentId,
      channelType,
      reason: transferReason,
      priority: selectedPriority,
      status: 'pending',
      requestedAt: new Date(),
    };

    setTransferRequests(prev => [...prev, newRequest]);
    
    // Call the actual transfer function
    const success = await transferToLiveAgent(conversationId, transferReason, selectedPriority);
    
    if (success) {
      toast({
        title: "Transfer Request Created",
        description: "Conversation added to live agent queue",
      });
    }

    // Reset form
    setTransferReason('');
    setSelectedPriority('normal');
  };

  // Assign request to live agent
  const assignToAgent = async (requestId: string, agentId: string) => {
    const agent = liveAgents.find(a => a.id === agentId);
    if (!agent) return;

    // Check agent capacity
    if (agent.currentLoad >= agent.maxCapacity) {
      toast({
        title: "Agent at Capacity",
        description: `${agent.name} is at maximum capacity`,
        variant: "destructive",
      });
      return;
    }

    // Update request
    setTransferRequests(prev => prev.map(request => 
      request.id === requestId 
        ? {
            ...request,
            status: 'assigned',
            assignedTo: agentId,
            assignedAt: new Date(),
          }
        : request
    ));

    // Update agent load
    setLiveAgents(prev => prev.map(a => 
      a.id === agentId 
        ? { ...a, currentLoad: a.currentLoad + 1 }
        : a
    ));

    toast({
      title: "Request Assigned",
      description: `Transfer request assigned to ${agent.name}`,
    });

    setIsAssignDialogOpen(false);
    setSelectedRequest(null);
  };

  // Escalate request
  const escalateRequest = async (requestId: string) => {
    setTransferRequests(prev => prev.map(request => 
      request.id === requestId 
        ? {
            ...request,
            status: 'escalated',
            priority: 'high',
          }
        : request
    ));

    toast({
      title: "Request Escalated",
      description: "Transfer request escalated to management",
    });
  };

  // Get available agents for assignment
  const getAvailableAgents = () => {
    return liveAgents.filter(agent => 
      agent.status === 'available' && agent.currentLoad < agent.maxCapacity
    );
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: TransferRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'default';
      case 'completed': return 'secondary';
      case 'escalated': return 'destructive';
      default: return 'outline';
    }
  };

  // Get priority badge color
  const getPriorityBadgeVariant = (priority: TransferRequest['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Get agent status color
  const getAgentStatusColor = (status: LiveAgent['status']) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'away': return 'text-blue-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Add new agent
  const handleAddAgent = async () => {
    const newLiveAgent: LiveAgent = {
      id: `agent_${Date.now()}`,
      name: newAgent.name,
      email: newAgent.email,
      department: newAgent.department,
      skills: newAgent.skills,
      status: 'available',
      currentLoad: 0,
      maxCapacity: newAgent.maxCapacity,
      avgResponseTime: 45
    };

    setLiveAgents(prev => [...prev, newLiveAgent]);
    setShowAddAgent(false);
    setNewAgent({
      name: '',
      email: '',
      department: '',
      skills: [],
      maxCapacity: 5
    });

    toast({
      title: "Agent Added",
      description: `${newAgent.name} has been added successfully.`,
    });
  };

  // Edit agent
  const handleEditAgent = (agent: LiveAgent) => {
    setEditingAgent(agent);
    setShowEditAgent(true);
  };

  // Update agent
  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    setLiveAgents(prev => prev.map(agent => 
      agent.id === editingAgent.id ? editingAgent : agent
    ));

    setShowEditAgent(false);
    setEditingAgent(null);

    toast({
      title: "Agent Updated",
      description: "Agent information has been updated successfully.",
    });
  };

  // Deactivate agent
  const handleDeactivateAgent = async (agentId: string) => {
    setLiveAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'offline' as const }
        : agent
    ));

    toast({
      title: "Agent Deactivated",
      description: "Agent has been marked as offline.",
    });
  };

  // Activate agent
  const handleActivateAgent = async (agentId: string) => {
    setLiveAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'available' as const }
        : agent
    ));

    toast({
      title: "Agent Activated",
      description: "Agent has been marked as available.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Live Agent Transfer</h2>
          <p className="text-muted-foreground">
            Manage conversation transfers to live customer service agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddAgent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Live Agent
          </Button>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Transfer Queue ({filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(request.priority)}>
                            {request.priority} priority
                          </Badge>
                          <Badge variant="outline">{request.channelType}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {request.requestedAt.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Conversation:</span>{' '}
                          {request.conversationId.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="text-muted-foreground">Agent ID:</span>{' '}
                          {request.agentId.slice(0, 8)}...
                        </div>
                      </div>

                      {request.reason && (
                        <div className="text-sm mb-3">
                          <span className="text-muted-foreground">Reason:</span> {request.reason}
                        </div>
                      )}

                      {request.assignedTo && (
                        <div className="text-sm mb-3">
                          <span className="text-muted-foreground">Assigned to:</span>{' '}
                          {liveAgents.find(a => a.id === request.assignedTo)?.name || 'Unknown'}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsAssignDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <ArrowRight className="h-4 w-4" />
                              Assign Agent
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => escalateRequest(request.id)}
                              className="gap-2"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Escalate
                            </Button>
                          </>
                        )}
                        {request.status === 'assigned' && (
                          <Button size="sm" variant="secondary" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Assigned
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transfer requests in queue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Agents Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Live Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{agent.name}</h4>
                      <div className={`text-sm ${getAgentStatusColor(agent.status)}`}>
                        {agent.status}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {agent.department}
                    </div>
                    
                    <div className="text-xs mb-2">
                      <div className="flex justify-between">
                        <span>Load:</span>
                        <span>{agent.currentLoad}/{agent.maxCapacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(agent.currentLoad / agent.maxCapacity) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Avg response: {agent.avgResponseTime}s
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.skills.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {agent.status === 'offline' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivateAgent(agent.id)}
                        >
                          <Power className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateAgent(agent.id)}
                        >
                          <PowerOff className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Queue Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium">
                  {transferRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assigned:</span>
                <span className="font-medium">
                  {transferRequests.filter(r => r.status === 'assigned').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Agents:</span>
                <span className="font-medium">{getAvailableAgents().length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Wait Time:</span>
                <span className="font-medium">2.5 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Live Agent</DialogTitle>
            <DialogDescription>
              Select an available agent to handle this transfer request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium mb-1">Transfer Request Details</div>
                  <div className="text-muted-foreground">
                    Priority: {selectedRequest.priority} | Channel: {selectedRequest.channelType}
                  </div>
                  {selectedRequest.reason && (
                    <div className="text-muted-foreground">
                      Reason: {selectedRequest.reason}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium">Available Agents</h4>
              {getAvailableAgents().map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => selectedRequest && assignToAgent(selectedRequest.id, agent.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.department} • {agent.currentLoad}/{agent.maxCapacity} capacity
                      </div>
                    </div>
                    <Button size="sm">Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={showAddAgent} onOpenChange={setShowAddAgent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Live Agent</DialogTitle>
            <DialogDescription>
              Add a new live agent to handle customer conversations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={newAgent.email}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter agent email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select 
                value={newAgent.department} 
                onValueChange={(value) => setNewAgent(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Escalations">Escalations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Capacity</label>
              <Input
                type="number"
                value={newAgent.maxCapacity}
                onChange={(e) => setNewAgent(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                placeholder="Maximum concurrent conversations"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAgent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgent}>
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditAgent} onOpenChange={setShowEditAgent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Live Agent</DialogTitle>
            <DialogDescription>
              Update agent information and settings.
            </DialogDescription>
          </DialogHeader>
          
          {editingAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    placeholder="Enter agent name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editingAgent.email}
                    onChange={(e) => setEditingAgent(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                    placeholder="Enter agent email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select 
                  value={editingAgent.department} 
                  onValueChange={(value) => setEditingAgent(prev => prev ? ({ ...prev, department: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Escalations">Escalations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Capacity</label>
                <Input
                  type="number"
                  value={editingAgent.maxCapacity}
                  onChange={(e) => setEditingAgent(prev => prev ? ({ ...prev, maxCapacity: parseInt(e.target.value) }) : null)}
                  placeholder="Maximum concurrent conversations"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editingAgent.status} 
                  onValueChange={(value: any) => setEditingAgent(prev => prev ? ({ ...prev, status: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAgent(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent}>
              Update Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};