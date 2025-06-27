
/**
 * Auto Integration Banner - Shows automatic integration status and triggers
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Shield,
  FileText,
  Code2,
  Brain,
  Key
} from 'lucide-react';
import { useApiConsumptionTrigger } from '@/hooks/useApiConsumptionTrigger';
import { useApiKeyMonitor } from '@/hooks/useApiKeyMonitor';

const AutoIntegrationBanner = () => {
  const {
    orchestrationResults,
    isOrchestrating,
    triggerManualOrchestration,
    isManualTriggering
  } = useApiConsumptionTrigger();
  
  const { apiKeys } = useApiKeyMonitor();

  const getOverallStatus = () => {
    const recentKeys = apiKeys?.filter(key => 
      new Date(key.created_at) > new Date(Date.now() - 300000) // 5 minutes
    ).length || 0;

    if (recentKeys > 0) {
      return { 
        status: 'auto-active', 
        message: `${recentKeys} API key${recentKeys > 1 ? 's' : ''} auto-activated`, 
        color: 'default' 
      };
    }

    if (!orchestrationResults || orchestrationResults.length === 0) {
      return { status: 'idle', message: 'Auto-integration ready', color: 'secondary' };
    }

    const totalResults = orchestrationResults.length;
    const successfulResults = orchestrationResults.filter(r => r.success).length;
    const failedResults = totalResults - successfulResults;

    if (failedResults === 0) {
      return { status: 'success', message: 'All integrations automated', color: 'default' };
    } else if (successfulResults > 0) {
      return { status: 'partial', message: `${successfulResults}/${totalResults} integrations automated`, color: 'secondary' };
    } else {
      return { status: 'failed', message: 'Integration automation failed', color: 'destructive' };
    }
  };

  const getAutomationStats = () => {
    const apiKeyCount = apiKeys?.length || 0;
    const recentApiKeys = apiKeys?.filter(key => 
      new Date(key.created_at) > new Date(Date.now() - 300000)
    ).length || 0;

    if (!orchestrationResults || orchestrationResults.length === 0) {
      return {
        schemas: recentApiKeys,
        policies: recentApiKeys,
        mappings: recentApiKeys,
        modules: recentApiKeys,
        types: recentApiKeys,
        docs: recentApiKeys,
        apiKeys: apiKeyCount
      };
    }

    return orchestrationResults.reduce((acc, result) => ({
      schemas: acc.schemas + result.generatedSchemas.length,
      policies: acc.policies + result.generatedRLSPolicies.length,
      mappings: acc.mappings + result.generatedDataMappings.length,
      modules: acc.modules + result.registeredModules.length,
      types: acc.types + result.generatedTypeScriptTypes.length,
      docs: acc.docs + (result.generatedDocumentation ? 1 : 0),
      apiKeys: apiKeyCount
    }), { schemas: 0, policies: 0, mappings: 0, modules: 0, types: 0, docs: 0, apiKeys: apiKeyCount });
  };

  const overallStatus = getOverallStatus();
  const stats = getAutomationStats();
  const totalComponents = stats.schemas + stats.policies + stats.mappings + stats.modules + stats.types + stats.docs;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Framework Auto-Integration</h3>
              <p className="text-sm text-muted-foreground">
                Automatic schema, RLS, documentation, and TypeScript generation from API keys
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={overallStatus.color as any}>
              {overallStatus.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'auto-active' && <Key className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'partial' && <AlertCircle className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
              {overallStatus.message}
            </Badge>
            {isOrchestrating && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        </div>

        {/* Automation Statistics */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Key className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="font-semibold text-lg">{stats.apiKeys}</span>
            </div>
            <p className="text-xs text-muted-foreground">API Keys</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Database className="h-4 w-4 text-blue-600 mr-1" />
              <span className="font-semibold text-lg">{stats.schemas}</span>
            </div>
            <p className="text-xs text-muted-foreground">Schemas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Shield className="h-4 w-4 text-green-600 mr-1" />
              <span className="font-semibold text-lg">{stats.policies}</span>
            </div>
            <p className="text-xs text-muted-foreground">RLS Policies</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <RefreshCw className="h-4 w-4 text-purple-600 mr-1" />
              <span className="font-semibold text-lg">{stats.mappings}</span>
            </div>
            <p className="text-xs text-muted-foreground">Mappings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Settings className="h-4 w-4 text-orange-600 mr-1" />
              <span className="font-semibold text-lg">{stats.modules}</span>
            </div>
            <p className="text-xs text-muted-foreground">Modules</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Code2 className="h-4 w-4 text-indigo-600 mr-1" />
              <span className="font-semibold text-lg">{stats.types}</span>
            </div>
            <p className="text-xs text-muted-foreground">TS Types</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="h-4 w-4 text-teal-600 mr-1" />
              <span className="font-semibold text-lg">{stats.docs}</span>
            </div>
            <p className="text-xs text-muted-foreground">Docs</p>
          </div>
        </div>

        {/* Progress and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Framework Alignment</span>
              <span>{totalComponents} components generated</span>
            </div>
            <Progress 
              value={totalComponents > 0 ? Math.min(100, (totalComponents / 20) * 100) : 0} 
              className="h-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerManualOrchestration({
                apiId: 'manual-trigger',
                autoGenerateSchema: true,
                autoGenerateRLS: true,
                autoGenerateDocumentation: true,
                autoGenerateDataMappings: true,
                autoRegisterModules: true,
                generateTypeScriptTypes: true,
                syncWithKnowledgeBase: true
              })}
              disabled={isManualTriggering}
            >
              {isManualTriggering ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Trigger Auto-Integration
            </Button>
          </div>
        </div>

        {/* Framework Alignment Notice */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🔑 API Key Automation:</strong> When you create an API key, the framework automatically:
            generates database schemas, creates RLS policies, builds documentation, registers modules, 
            and syncs with the knowledge base. All integrations are activated instantly upon key creation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoIntegrationBanner;
