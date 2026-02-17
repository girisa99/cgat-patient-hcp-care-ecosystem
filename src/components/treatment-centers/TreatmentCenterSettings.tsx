import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, Building2, Phone, Mail, MapPin, 
  Shield, Bell, Users, Bot, Save, Trash2 
} from "lucide-react";

interface TreatmentCenterSettingsProps {
  center: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCenter: any) => void;
}

export const TreatmentCenterSettings: React.FC<TreatmentCenterSettingsProps> = ({
  center,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: center?.name || '',
    facility_type: center?.facility_type || '',
    address: center?.address || '',
    phone: center?.phone || '',
    email: center?.email || '',
    capacity: center?.capacity || '',
    specializations: center?.specializations || [],
    license_number: center?.license_number || '',
    certification_level: center?.certification_level || '',
    is_active: center?.is_active || true,
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      agent_alerts: true,
      performance_reports: true,
    },
    security: {
      two_factor_required: false,
      audit_logging: true,
      data_retention_days: 90,
    },
    agent_settings: {
      auto_assignment: true,
      max_concurrent_conversations: 10,
      escalation_timeout: 30,
    }
  });

  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the center
      await onSave({ ...center, ...formData });
      
      toast({
        title: "Settings Updated",
        description: `Settings for ${formData.name} have been successfully updated.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update treatment center settings.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {center.name} - Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="child-tabs">
          <TabsList className="child-tabs">
            <TabsTrigger value="basic" className="child-tab-trigger">
              <Building2 className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="child-tab-trigger">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="child-tab-trigger">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="child-tab-trigger">
              <Bot className="h-4 w-4" />
              <span>Agent Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Treatment Center Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter center name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facility_type">Facility Type</Label>
                    <Select 
                      value={formData.facility_type} 
                      onValueChange={(value) => handleInputChange('facility_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inpatient">Inpatient</SelectItem>
                        <SelectItem value="outpatient">Outpatient</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="detox">Detox</SelectItem>
                        <SelectItem value="dual-diagnosis">Dual Diagnosis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="Patient capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="License number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Contact email"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="active">Treatment Center Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={formData.notifications.email_enabled}
                      onCheckedChange={(checked) => handleNestedChange('notifications', 'email_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={formData.notifications.sms_enabled}
                      onCheckedChange={(checked) => handleNestedChange('notifications', 'sms_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="agent-alerts">Agent Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications about agent performance</p>
                    </div>
                    <Switch
                      id="agent-alerts"
                      checked={formData.notifications.agent_alerts}
                      onCheckedChange={(checked) => handleNestedChange('notifications', 'agent_alerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="performance-reports">Performance Reports</Label>
                      <p className="text-sm text-muted-foreground">Weekly performance summaries</p>
                    </div>
                    <Switch
                      id="performance-reports"
                      checked={formData.notifications.performance_reports}
                      onCheckedChange={(checked) => handleNestedChange('notifications', 'performance_reports', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all staff access</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={formData.security.two_factor_required}
                      onCheckedChange={(checked) => handleNestedChange('security', 'two_factor_required', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit-logging">Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all system activities</p>
                    </div>
                    <Switch
                      id="audit-logging"
                      checked={formData.security.audit_logging}
                      onCheckedChange={(checked) => handleNestedChange('security', 'audit_logging', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={formData.security.data_retention_days}
                      onChange={(e) => handleNestedChange('security', 'data_retention_days', parseInt(e.target.value))}
                      placeholder="90"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-assignment">Auto Agent Assignment</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign agents to conversations</p>
                    </div>
                    <Switch
                      id="auto-assignment"
                      checked={formData.agent_settings.auto_assignment}
                      onCheckedChange={(checked) => handleNestedChange('agent_settings', 'auto_assignment', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concurrent">Max Concurrent Conversations</Label>
                    <Input
                      id="concurrent"
                      type="number"
                      value={formData.agent_settings.max_concurrent_conversations}
                      onChange={(e) => handleNestedChange('agent_settings', 'max_concurrent_conversations', parseInt(e.target.value))}
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalation">Escalation Timeout (minutes)</Label>
                    <Input
                      id="escalation"
                      type="number"
                      value={formData.agent_settings.escalation_timeout}
                      onChange={(e) => handleNestedChange('agent_settings', 'escalation_timeout', parseInt(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 mt-6">
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Center
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};