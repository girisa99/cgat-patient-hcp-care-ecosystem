import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, MapPin, Phone, Mail, Users, Bot, 
  Plus, Settings, Activity, Search, Filter, ChevronDown
} from "lucide-react";
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { useAgents } from '@/hooks/useAgents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TreatmentCentersView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [showAgentAssignment, setShowAgentAssignment] = useState(false);
  const { toast } = useToast();

  const { facilities, isLoading, facilityStats } = useMasterFacilities();
  
  // Get agents using the proper hook
  const { agents, isLoading: agentsLoading } = useAgents();

  // Get agent assignments for treatment centers
  const { data: agentAssignments = [] } = useQuery({
    queryKey: ['agent-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_organization_mapping')
        .select(`
          id,
          agent_id,
          facility_id,
          business_unit,
          department,
          created_at
        `);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter facilities based on search
  const filteredCenters = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.facility_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignAgent = async (facilityId: string, agentId: string, useCase: string, categories: string[], topics: string[]) => {
    try {
      const { error } = await supabase
        .from('agent_organization_mapping')
        .insert({
          agent_id: agentId,
          facility_id: facilityId,
          business_unit: useCase,
          department: categories.join(', ')
        });

      if (error) throw error;
      
      // Refresh assignments
      window.location.reload();
    } catch (error) {
      console.error('Error assigning agent:', error);
    }
  };

  const getAssignedAgents = (facilityId: string) => {
    return agentAssignments.filter(assignment => assignment.facility_id === facilityId);
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const handleManageCenter = (centerId: string) => {
    const center = facilities.find(f => f.id === centerId);
    if (center) {
      setSelectedCenter(center);
      // Here you would typically open a management dialog
      // For now, we'll show a more detailed toast
      toast({
        title: "Treatment Center Management",
        description: `Managing ${center.name} - View analytics, update settings, manage staff assignments, and configure services.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Treatment Centers
          </h2>
          <p className="text-muted-foreground">
            Manage treatment center facilities and assign agents to specific centers, use cases, and business units.
          </p>
        </div>
        <Button onClick={() => setShowAgentAssignment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Agent
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Centers</p>
                <p className="text-2xl font-bold text-blue-900">{facilities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Centers</p>
                <p className="text-2xl font-bold text-green-900">{facilityStats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Assigned Agents</p>
                <p className="text-2xl font-bold text-purple-900">{agentAssignments.length}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Available Agents</p>
                <p className="text-2xl font-bold text-orange-900">{agents.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search treatment centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Treatment Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map((center) => {
          const assignedAgents = getAssignedAgents(center.id);
          
          return (
            <Card key={center.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="truncate">{center.name}</span>
                  </div>
                  <Badge variant={center.is_active ? "default" : "secondary"}>
                    {center.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Badge variant="outline">{center.facility_type}</Badge>
                  </div>
                  
                  {center.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs truncate">{center.address}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {center.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{center.phone}</span>
                      </div>
                    )}
                    {center.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{center.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Agents */}
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    Assigned Agents ({assignedAgents.length})
                  </h4>
                  
                  {assignedAgents.length > 0 ? (
                    <div className="space-y-2">
                      {assignedAgents.slice(0, 3).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <div>
                            <span className="font-medium">{getAgentName(assignment.agent_id)}</span>
                            {assignment.business_unit && (
                              <div className="text-gray-500">
                                Use Case: {assignment.business_unit}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      ))}
                      {assignedAgents.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{assignedAgents.length - 3} more agents
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No agents assigned</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {/* Assign Agent Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={agentsLoading || agents.length === 0}>
                        <Plus className="h-3 w-3 mr-1" />
                        Assign Agent
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start">
                      {agentsLoading ? (
                        <DropdownMenuItem disabled>Loading agents...</DropdownMenuItem>
                      ) : agents.length === 0 ? (
                        <DropdownMenuItem disabled>No agents available</DropdownMenuItem>
                      ) : (
                        agents.slice(0, 10).map((agent) => (
                          <DropdownMenuItem
                            key={agent.id}
                            onClick={() => {
                              handleAssignAgent(
                                center.id,
                                agent.id,
                                agent.use_case || 'General',
                                agent.categories || [],
                                agent.topics || []
                              );
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{agent.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {agent.description?.slice(0, 50)}...
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                      {agents.length > 10 && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCenter(center);
                            setShowAgentAssignment(true);
                          }}
                        >
                          View all {agents.length} agents...
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Manage Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleManageCenter(center.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Analytics",
                          description: `Opening analytics dashboard for ${center.name}`,
                        });
                      }}>
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Configuration",
                          description: `Opening configuration panel for ${center.name}`,
                        });
                      }}>
                        Configure Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Staff Management", 
                          description: `Opening staff management for ${center.name}`,
                        });
                      }}>
                        Manage Staff
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Treatment Centers Found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search terms.' : 'No treatment centers are available.'}
          </p>
        </div>
      )}

      {/* Agent Assignment Dialog */}
      {showAgentAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>
                Assign Agent to {selectedCenter?.name || 'Treatment Center'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCenter && (
                <div className="p-3 bg-blue-50 rounded border">
                  <h4 className="font-medium text-blue-900">{selectedCenter.name}</h4>
                  <p className="text-sm text-blue-700">{selectedCenter.facility_type}</p>
                  {selectedCenter.address && (
                    <p className="text-xs text-blue-600">{selectedCenter.address}</p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Available Agents</h4>
                <div className="grid gap-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="p-4 border rounded hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{agent.name}</h5>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (selectedCenter) {
                              handleAssignAgent(
                                selectedCenter.id,
                                agent.id,
                                agent.use_case || 'General',
                                agent.categories || [],
                                agent.topics || []
                              );
                            }
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {agent.use_case && (
                          <Badge variant="outline" className="text-xs">
                            {agent.use_case}
                          </Badge>
                        )}
                        {agent.categories?.slice(0, 2).map((category: string) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAgentAssignment(false);
                    setSelectedCenter(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TreatmentCentersView;