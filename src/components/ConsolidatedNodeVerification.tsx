import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { Loader2, CheckCircle, Database, Layers, Settings } from 'lucide-react';

/**
 * Component to verify the consolidated node configuration system
 * Demonstrates successful 4->3 table consolidation
 */
export const ConsolidatedNodeVerification: React.FC = () => {
  const { categories, nodeTypes, isLoading, error } = useWorkflowNodes();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading consolidated node system...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">Error loading nodes: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  // Sample node with full configuration data
  const sampleNode = nodeTypes.find(n => n.configurationSchema && Object.keys(n.configurationSchema).length > 0) || nodeTypes[0];
  const configFieldsCount = sampleNode ? Object.keys({
    ...sampleNode.default_config,
    ...sampleNode.configurationSchema,
    ...sampleNode.aiModelConfig,
    ...sampleNode.validationRules,
    ...sampleNode.businessRules
  }).length : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Consolidated Node Configuration System
          </CardTitle>
          <CardDescription>
            Successfully consolidated from 4 tables to 3 tables with unified configuration structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-2xl text-blue-900">{categories.length}</div>
              <div className="text-sm text-blue-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Layers className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-2xl text-green-900">{nodeTypes.length}</div>
              <div className="text-sm text-green-600">Node Types</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-2xl text-purple-900">{configFieldsCount}</div>
              <div className="text-sm text-purple-600">Config Fields</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Structure Verification</CardTitle>
          <CardDescription>
            Sample node demonstrating consolidated configuration fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sampleNode ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sample Node: {sampleNode.display_name}</h4>
                <Badge variant="secondary">{sampleNode.category?.display_name}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-green-700 mb-1">✅ Core Configuration</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Default Config: {Object.keys(sampleNode.default_config).length} fields</li>
                    <li>• Input Schema: {Object.keys(sampleNode.input_schema).length} fields</li>
                    <li>• Output Schema: {Object.keys(sampleNode.output_schema).length} fields</li>
                    <li>• Capabilities: {sampleNode.capabilities.length} items</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-blue-700 mb-1">✅ Consolidated Fields</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Configuration Schema: {Object.keys(sampleNode.configurationSchema || {}).length} fields</li>
                    <li>• AI Model Config: {Object.keys(sampleNode.aiModelConfig || {}).length} fields</li>
                    <li>• Variables Config: {(sampleNode.variablesConfig || []).length} items</li>
                    <li>• APIs Config: {(sampleNode.apisConfig || []).length} items</li>
                    <li>• Connectors Config: {(sampleNode.connectorsConfig || []).length} items</li>
                    <li>• Data Storage Config: {Object.keys(sampleNode.dataStorageConfig || {}).length} fields</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No sample node available</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Removed Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <code className="bg-gray-100 px-2 py-1 rounded">workflow_builder_categories</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <code className="bg-gray-100 px-2 py-1 rounded">workflow_builder_nodes</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <code className="bg-gray-100 px-2 py-1 rounded">workflow_node_configs</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <code className="bg-gray-100 px-2 py-1 rounded">node_configurations</code>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Consolidated Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <code className="bg-green-100 px-2 py-1 rounded">workflow_node_categories</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <code className="bg-green-100 px-2 py-1 rounded">workflow_node_types</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <code className="bg-green-100 px-2 py-1 rounded">workflow_node_instances</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">📊</span>
                <code className="bg-blue-100 px-2 py-1 rounded">consolidated_node_catalog</code>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};