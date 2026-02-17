import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, Key, Lock, Globe, Clock, AlertTriangle,
  CheckCircle, XCircle, Settings, Plus, Edit, Save, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityPolicy {
  id: string;
  name: string;
  type: string;
  config: any;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface SecurityGatewayManagerProps {
  onClose?: () => void;
}

const SecurityGatewayManager: React.FC<SecurityGatewayManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('policies');
  const [formData, setFormData] = useState({
    name: '',
    type: 'oauth2',
    description: '',
    config: {
      client_id: '',
      client_secret: '',
      auth_url: '',
      token_url: '',
      scopes: '',
      rate_limit: 1000,
      rate_window: 'hour',
      require_https: true,
      jwt_secret: '',
      token_expiry: 3600
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch security policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['security-policies'],
    queryFn: async (): Promise<SecurityPolicy[]> => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('category', 'security_gateway')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type || 'oauth2',
        config: item.security_requirements || {},
        status: item.status,
        description: item.description,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // For now, we'll store in api_integration_registry as a security service
      const { data: result, error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: data.name,
          type: 'security',
          category: 'security_gateway',
          purpose: 'Security and authentication management',
          direction: 'internal',
          description: data.description,
          status: 'active',
          security_requirements: data.config
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!result) { throw new Error('Insert failed: no data returned'); }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Security Policy Created",
        description: "The security policy has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['security-policies'] });
      setFormData({
        name: '',
        type: 'oauth2',
        description: '',
        config: {
          client_id: '',
          client_secret: '',
          auth_url: '',
          token_url: '',
          scopes: '',
          rate_limit: 1000,
          rate_window: 'hour',
          require_https: true,
          jwt_secret: '',
          token_expiry: 3600
        }
      });
      setActiveTab('policies');
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create security policy",
        variant: "destructive",
      });
    }
  });

  const handleCreatePolicy = () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a policy name",
        variant: "destructive",
      });
      return;
    }
    createPolicyMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const securityMetrics = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === 'active').length,
    oauth2Policies: policies.filter(p => p.type === 'oauth2').length,
    jwtPolicies: policies.filter(p => p.type === 'jwt').length
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Gateway Manager
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage authentication, authorization, and security policies
              </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Security Policies */}
            <TabsContent value="policies" className="space-y-4">
              {/* Security Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Policies</p>
                        <p className="text-2xl font-bold text-blue-900">{securityMetrics.totalPolicies}</p>
                      </div>
                      <Shield className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-900">{securityMetrics.activePolicies}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">OAuth 2.0</p>
                        <p className="text-2xl font-bold text-purple-900">{securityMetrics.oauth2Policies}</p>
                      </div>
                      <Key className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">JWT Tokens</p>
                        <p className="text-2xl font-bold text-orange-900">{securityMetrics.jwtPolicies}</p>
                      </div>
                      <Lock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : policies.length > 0 ? (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-green-600" />
                            <div>
                              <h3 className="font-semibold">{policy.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{policy.type}</Badge>
                                <span>{policy.description}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(policy.status)}
                              <Badge className={getStatusColor(policy.status)}>
                                {policy.status}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Security Policies</h3>
                  <p className="text-gray-600 mb-4">Create your first security policy to get started.</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Policy
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Create New Policy */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Policy Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Healthcare API OAuth Policy"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Authentication Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        <SelectItem value="jwt">JWT Tokens</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="basic_auth">Basic Auth</SelectItem>
                        <SelectItem value="saml">SAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this security policy..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.type === 'oauth2' && (
                    <>
                      <div>
                        <Label htmlFor="client_id">Client ID</Label>
                        <Input
                          id="client_id"
                          value={formData.config.client_id}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            config: { ...prev.config, client_id: e.target.value }
                          }))}
                          placeholder="OAuth2 Client ID"
                        />
                      </div>

                      <div>
                        <Label htmlFor="auth_url">Authorization URL</Label>
                        <Input
                          id="auth_url"
                          value={formData.config.auth_url}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            config: { ...prev.config, auth_url: e.target.value }
                          }))}
                          placeholder="https://auth.example.com/oauth2/auth"
                        />
                      </div>

                      <div>
                        <Label htmlFor="scopes">Scopes</Label>
                        <Input
                          id="scopes"
                          value={formData.config.scopes}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            config: { ...prev.config, scopes: e.target.value }
                          }))}
                          placeholder="read:user write:data"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="rate_limit">Rate Limit</Label>
                      <Input
                        id="rate_limit"
                        type="number"
                        value={formData.config.rate_limit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          config: { ...prev.config, rate_limit: parseInt(e.target.value) || 1000 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_window">Per</Label>
                      <Select value={formData.config.rate_window} onValueChange={(value) => 
                        setFormData(prev => ({
                          ...prev,
                          config: { ...prev.config, rate_window: value }
                        }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minute">Minute</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_https"
                      checked={formData.config.require_https}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, require_https: checked }
                      }))}
                    />
                    <Label htmlFor="require_https">Require HTTPS</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab('policies')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePolicy}
                  disabled={createPolicyMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createPolicyMutation.isPending ? 'Creating...' : 'Create Policy'}
                </Button>
              </div>
            </TabsContent>

            {/* Monitoring */}
            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Security Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <div>
                          <p className="font-medium text-red-800">Failed Login Attempt</p>
                          <p className="text-sm text-red-600">Multiple failed login attempts detected</p>
                        </div>
                        <Badge variant="destructive">High</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                        <div>
                          <p className="font-medium text-yellow-800">Rate Limit Exceeded</p>
                          <p className="text-sm text-yellow-600">API rate limit exceeded for client</p>
                        </div>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium">OAuth token refreshed</p>
                        <p className="text-gray-600">2 minutes ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">New API key generated</p>
                        <p className="text-gray-600">15 minutes ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Security policy updated</p>
                        <p className="text-gray-600">1 hour ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Multi-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require MFA for all administrative actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-gray-600">Log all security-related events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Security Updates</Label>
                      <p className="text-sm text-gray-600">Automatically apply security patches</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityGatewayManager;