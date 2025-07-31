import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Map, Plus, Search, Edit, Trash2, Database,
  ArrowRight, Settings, CheckCircle, AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface FieldMapping {
  id: string;
  source_field: string;
  target_field: string;
  field_type: string;
  transformation_rule?: string;
  default_value?: string;
  validation_rules: any;
  is_required: boolean;
  data_sensitivity: string;
  api_integration_id?: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseTable {
  table_name: string;
  column_count: number;
  table_type: string;
  table_schema: string;
}

const FieldMappingManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSourceTable, setSelectedSourceTable] = useState<string>('');
  const [activeTab, setActiveTab] = useState('mappings');
  const [newMapping, setNewMapping] = useState({
    source_field: '',
    target_field: '',
    field_type: 'string',
    transformation_rule: 'direct',
    default_value: '',
    is_required: false,
    data_sensitivity: 'standard',
    api_integration_id: ''
  });

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch field mappings
  const { data: mappings = [], isLoading: isLoadingMappings } = useQuery({
    queryKey: ['field-mappings'],
    queryFn: async (): Promise<FieldMapping[]> => {
      const { data, error } = await supabase
        .from('api_mapping_fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
  });

  // Fetch database tables for source selection
  const { data: databaseTables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['database-tables'],
    queryFn: async (): Promise<DatabaseTable[]> => {
      try {
        // Try the RPC function if it exists
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_complete_schema_info');
        
        if (!rpcError && rpcData && Array.isArray(rpcData)) {
          const tables = rpcData.map((table: any) => ({
            table_name: table.table_name,
            column_count: table.columns?.length || 0,
            table_type: table.table_type || 'BASE TABLE',
            table_schema: table.table_schema || 'public'
          }));
          
          if (tables.length > 0) {
            return tables;
          }
        }
      } catch (error) {
        console.warn('RPC function not available, using fallback data:', error);
      }
      
      // Use predefined healthcare-specific tables as fallback
      return [
        { table_name: 'profiles', column_count: 8, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'facilities', column_count: 12, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'agents', column_count: 15, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'agent_sessions', column_count: 10, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'credit_applications', column_count: 20, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'user_roles', column_count: 4, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'api_integration_registry', column_count: 25, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'api_mapping_fields', column_count: 12, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'agent_conversations', column_count: 8, table_type: 'BASE TABLE', table_schema: 'public' },
        { table_name: 'api_keys', column_count: 16, table_type: 'BASE TABLE', table_schema: 'public' }
      ];
    },
    staleTime: 600000, // Cache for 10 minutes
  });

  // Get relevant tables for mapping (show all tables for flexibility)
  const onboardingTables = databaseTables.length > 0 ? databaseTables : [
    // Fallback if no tables are loaded
    { table_name: 'profiles', column_count: 8, table_type: 'BASE TABLE', table_schema: 'public' },
    { table_name: 'facilities', column_count: 12, table_type: 'BASE TABLE', table_schema: 'public' },
    { table_name: 'agents', column_count: 15, table_type: 'BASE TABLE', table_schema: 'public' },
    { table_name: 'user_roles', column_count: 4, table_type: 'BASE TABLE', table_schema: 'public' },
    { table_name: 'credit_applications', column_count: 20, table_type: 'BASE TABLE', table_schema: 'public' }
  ];

  // Get API integrations for target selection
  const { data: apiIntegrations = [] } = useQuery({
    queryKey: ['api-integrations-for-mapping'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('api_integration_registry')
          .select('id, name, type, direction')
          .eq('status', 'active');

        if (error) throw error;
        
        // If no APIs found, return some sample APIs for demonstration
        if (!data || data.length === 0) {
          return [
            { id: '1', name: 'Healthcare API v1', type: 'REST', direction: 'bidirectional' },
            { id: '2', name: 'Patient Data Service', type: 'GraphQL', direction: 'outbound' },
            { id: '3', name: 'EHR Integration', type: 'REST', direction: 'inbound' },
            { id: '4', name: 'Billing System API', type: 'REST', direction: 'bidirectional' }
          ];
        }
        
        return data;
      } catch (error) {
        console.warn('Error fetching API integrations:', error);
        return [
          { id: '1', name: 'Healthcare API v1', type: 'REST', direction: 'bidirectional' },
          { id: '2', name: 'Patient Data Service', type: 'GraphQL', direction: 'outbound' },
          { id: '3', name: 'EHR Integration', type: 'REST', direction: 'inbound' },
          { id: '4', name: 'Billing System API', type: 'REST', direction: 'bidirectional' }
        ];
      }
    }
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: async (mappingData: any) => {
      const { data, error } = await supabase
        .from('api_mapping_fields')
        .insert([{
          ...mappingData,
          validation_rules: {},
          field_category: 'standard',
          mapping_direction: 'bidirectional'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-mappings'] });
      setShowCreateDialog(false);
      setNewMapping({
        source_field: '',
        target_field: '',
        field_type: 'string',
        transformation_rule: 'direct',
        default_value: '',
        is_required: false,
        data_sensitivity: 'standard',
        api_integration_id: ''
      });
      showSuccess('Field mapping created successfully');
    },
    onError: (error) => {
      showError('Failed to create field mapping');
      console.error('Create mapping error:', error);
    }
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await supabase
        .from('api_mapping_fields')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-mappings'] });
      showSuccess('Field mapping deleted successfully');
    },
    onError: () => {
      showError('Failed to delete field mapping');
    }
  });

  const filteredMappings = mappings.filter(mapping =>
    mapping.source_field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mapping.target_field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mapping.field_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMapping = () => {
    if (!newMapping.source_field.trim() || !newMapping.target_field.trim()) {
      showError('Please enter both source and target fields');
      return;
    }
    
    createMappingMutation.mutate(newMapping);
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800';
      case 'integer': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      case 'date': return 'bg-orange-100 text-orange-800';
      case 'json': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'standard': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Map className="h-6 w-6" />
            <span>Field Mapping Manager</span>
          </h2>
          <p className="text-gray-600">Manage data field mappings between systems</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Field Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source Table</label>
                  <Select value={selectedSourceTable} onValueChange={setSelectedSourceTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source table" />
                    </SelectTrigger>
                    <SelectContent>
                      {onboardingTables.map(table => (
                        <SelectItem key={table.table_name} value={table.table_name}>
                          {table.table_name} ({table.column_count} cols)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Target API</label>
                  <Select 
                    value={newMapping.api_integration_id} 
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, api_integration_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target API" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiIntegrations.map(api => (
                        <SelectItem key={api.id} value={api.id}>
                          {api.name} ({api.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source Field</label>
                  <Input
                    placeholder="e.g., first_name"
                    value={newMapping.source_field}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, source_field: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Field</label>
                  <Input
                    placeholder="e.g., firstName"
                    value={newMapping.target_field}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, target_field: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Field Type</label>
                  <Select 
                    value={newMapping.field_type} 
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, field_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Transformation</label>
                  <Select 
                    value={newMapping.transformation_rule} 
                    onValueChange={(value) => setNewMapping(prev => ({ ...prev, transformation_rule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Mapping</SelectItem>
                      <SelectItem value="format">Format Transform</SelectItem>
                      <SelectItem value="concat">Concatenation</SelectItem>
                      <SelectItem value="split">Split Field</SelectItem>
                      <SelectItem value="custom">Custom Function</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Default Value (optional)</label>
                <Input
                  placeholder="Default value if source is empty"
                  value={newMapping.default_value}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, default_value: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data Sensitivity</label>
                <Select 
                  value={newMapping.data_sensitivity} 
                  onValueChange={(value) => setNewMapping(prev => ({ ...prev, data_sensitivity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (PII/PHI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateMapping}
                  disabled={createMappingMutation.isPending}
                >
                  {createMappingMutation.isPending ? 'Creating...' : 'Create Mapping'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <p className="text-2xl font-bold">{mappings.length}</p>
              </div>
              <Map className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Source Tables</p>
                <p className="text-2xl font-bold">{onboardingTables.length}</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active APIs</p>
                <p className="text-2xl font-bold">{apiIntegrations.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Sensitivity</p>
                <p className="text-2xl font-bold">
                  {mappings.filter(m => m.data_sensitivity === 'high').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search mappings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
          <TabsTrigger value="tables">Source Tables</TabsTrigger>
          <TabsTrigger value="apis">Target APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="mappings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mappings ({filteredMappings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMappings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No Field Mappings</h3>
                  <p className="text-sm mb-4">Create your first field mapping to connect data between systems.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mapping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMappings.map((mapping) => (
                    <div key={mapping.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{mapping.source_field}</Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">{mapping.target_field}</Badge>
                          </div>
                          <Badge className={getFieldTypeColor(mapping.field_type)}>
                            {mapping.field_type}
                          </Badge>
                          <Badge className={getSensitivityColor(mapping.data_sensitivity)}>
                            {mapping.data_sensitivity}
                          </Badge>
                          {mapping.is_required && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMappingMutation.mutate(mapping.id)}
                            disabled={deleteMappingMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {mapping.transformation_rule !== 'direct' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Transformation:</strong> {mapping.transformation_rule}
                        </div>
                      )}
                      
                      {mapping.default_value && (
                        <div className="mt-1 text-sm text-gray-600">
                          <strong>Default:</strong> {mapping.default_value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Source Tables ({onboardingTables.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onboardingTables.map((table) => (
                  <Card key={table.table_name} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{table.table_name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Columns:</span>
                          <span className="font-medium">{table.column_count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Schema:</span>
                          <Badge variant="outline">{table.table_schema}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="secondary">{table.table_type}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Target API Integrations ({apiIntegrations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiIntegrations.map((api) => (
                  <Card key={api.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-green-600" />
                        <span className="truncate">{api.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="outline">{api.type}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Direction:</span>
                          <Badge variant="secondary">{api.direction}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldMappingManager;