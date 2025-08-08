import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, MapPin, Phone, Mail, Users, Bot, 
  Calendar, Activity, Clock, AlertCircle 
} from "lucide-react";

interface TreatmentCenterDetailsDialogProps {
  center: any;
  isOpen: boolean;
  onClose: () => void;
  assignedAgents: any[];
  getAgentName: (agentId: string) => string;
}

export const TreatmentCenterDetailsDialog: React.FC<TreatmentCenterDetailsDialogProps> = ({
  center,
  isOpen,
  onClose,
  assignedAgents,
  getAgentName
}) => {
  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {center.name} - Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="child-tabs">
          <TabsList className="child-tabs">
            <TabsTrigger value="overview" className="child-tab-trigger">
              <Building2 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="child-tab-trigger">
              <Bot className="h-4 w-4" />
              <span>Assigned Agents</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="child-tab-trigger">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="child-tab-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={center.is_active ? "default" : "secondary"}>
                        {center.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">{center.facility_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(center.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {center.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                      <span className="text-sm">{center.address}</span>
                    </div>
                  )}
                  {center.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{center.phone}</span>
                    </div>
                  )}
                  {center.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{center.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facility Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Capacity:</span>
                    <p>{center.capacity || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Specializations:</span>
                    <p>{center.specializations?.join(', ') || 'General'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">License:</span>
                    <p>{center.license_number || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Certification:</span>
                    <p>{center.certification_level || 'Standard'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="child-tab-content space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Assigned Agents ({assignedAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedAgents.length > 0 ? (
                  <div className="grid gap-4">
                    {assignedAgents.map((assignment) => (
                      <div key={assignment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{getAgentName(assignment.agent_id)}</h4>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          {assignment.business_unit && (
                            <p><span className="font-medium">Use Case:</span> {assignment.business_unit}</p>
                          )}
                          {assignment.department && (
                            <p><span className="font-medium">Categories:</span> {assignment.department}</p>
                          )}
                          <p><span className="font-medium">Assigned:</span> {new Date(assignment.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No agents assigned to this treatment center</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="child-tab-content space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Agent Assignment</p>
                      <p className="text-xs text-gray-600">New agent assigned for patient coordination</p>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Settings Updated</p>
                      <p className="text-xs text-gray-600">Contact information updated</p>
                    </div>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Staff Changes</p>
                      <p className="text-xs text-gray-600">New staff member added</p>
                    </div>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};