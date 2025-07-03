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
  Key,
  Stethoscope,
  FlaskConical,
  CreditCard,
  Building2
} from 'lucide-react';
import { useApiConsumptionTrigger } from '@/hooks/useApiConsumptionTrigger';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';

const AutoIntegrationBanner = () => {
  const {
    orchestrationResults,
    isOrchestrating,
    triggerManualOrchestration,
    isManualTriggering
  } = useApiConsumptionTrigger();
  
  const { apiKeys } = useApiKeys();
  const { integrations, internalApis, externalApis } = useApiIntegrations();
  const { publishedApis } = useExternalApis();

  const getOverallStatus = () => {
    const recentKeys = apiKeys?.filter(key => 
      new Date(key.created_at) > new Date(Date.now() - 300000) // 5 minutes
    ).length || 0;

    const totalIntegrations = integrations?.length || 0;

    if (recentKeys > 0) {
      return { 
        status: 'auto-active', 
        message: `${recentKeys} API key${recentKeys > 1 ? 's' : ''} activated`, 
        color: 'default' 
      };
    }

    if (totalIntegrations > 5) {
      return { 
        status: 'enterprise-active', 
        message: `${totalIntegrations} integrations active`, 
        color: 'default' 
      };
    }

    if (!orchestrationResults || orchestrationResults.length === 0) {
      return { status: 'idle', message: 'System ready', color: 'secondary' };
    }

    const totalResults = orchestrationResults.length;
    const successfulResults = orchestrationResults.filter(r => r.success).length;
    const failedResults = totalResults - successfulResults;

    if (failedResults === 0) {
      return { status: 'success', message: 'All integrations active', color: 'default' };
    } else if (successfulResults > 0) {
      return { status: 'partial', message: `${successfulResults}/${totalResults} integrations active`, color: 'secondary' };
    } else {
      return { status: 'failed', message: 'Integration setup failed', color: 'destructive' };
    };
  };

  const getRealStats = () => {
    const apiKeyCount = apiKeys?.length || 0;
    const internalApiCount = internalApis?.length || 0;
    const externalApiCount = externalApis?.length || 0;
    const publishedApiCount = publishedApis?.length || 0;

    if (!orchestrationResults || orchestrationResults.length === 0) {
      return {
        schemas: 0,
        policies: 0,
        mappings: 0,
        modules: 0,
        types: 0,
        docs: 0,
        apiKeys: apiKeyCount,
        internalApis: internalApiCount,
        externalApis: externalApiCount,
        publishedApis: publishedApiCount
      };
    }

    return orchestrationResults.reduce((acc, result) => ({
      schemas: acc.schemas + result.generatedSchemas.length,
      policies: acc.policies + result.generatedRLSPolicies.length,
      mappings: acc.mappings + result.generatedDataMappings.length,
      modules: acc.modules + result.registeredModules.length,
      types: acc.types + result.generatedTypeScriptTypes.length,
      docs: acc.docs + (result.generatedDocumentation ? 1 : 0),
      apiKeys: apiKeyCount,
      internalApis: internalApiCount,
      externalApis: externalApiCount,
      publishedApis: publishedApiCount
    }), { 
      schemas: 0, policies: 0, mappings: 0, modules: 0, types: 0, docs: 0, 
      apiKeys: apiKeyCount, internalApis: internalApiCount, externalApis: externalApiCount, publishedApis: publishedApiCount
    });
  };

  const overallStatus = getOverallStatus();
  const stats = getRealStats();
  const totalTechnicalComponents = stats.schemas + stats.policies + stats.mappings + stats.modules + stats.types + stats.docs;
  const totalActiveIntegrations = stats.internalApis + stats.externalApis + stats.publishedApis;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Healthcare API Integration Platform</h3>
              <p className="text-sm text-muted-foreground">
                Real-time API management for internal services, external integrations, and publishing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={overallStatus.color as any}>
              {overallStatus.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'auto-active' && <Key className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'enterprise-active' && <Building2 className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'partial' && <AlertCircle className="h-3 w-3 mr-1" />}
              {overallStatus.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
              {overallStatus.message}
            </Badge>
            {isOrchestrating && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Internal APIs</p>
                    <p className="text-sm text-muted-foreground">Core Services</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{stats.internalApis}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">External APIs</p>
                    <p className="text-sm text-muted-foreground">Consuming</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{stats.externalApis}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">Published APIs</p>
                    <p className="text-sm text-muted-foreground">External Access</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{stats.publishedApis}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold">API Keys</p>
                    <p className="text-sm text-muted-foreground">Authentication</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{stats.apiKeys}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
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
            <p className="text-xs text-muted-foreground">Security</p>
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
            <p className="text-xs text-muted-foreground">Types</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="h-4 w-4 text-teal-600 mr-1" />
              <span className="font-semibold text-lg">{stats.docs}</span>
            </div>
            <p className="text-xs text-muted-foreground">Docs</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Integration Platform Progress</span>
              <span>{totalActiveIntegrations} active integrations</span>
            </div>
            <Progress 
              value={totalActiveIntegrations > 0 ? Math.min(100, (totalActiveIntegrations / 10) * 100) : 0} 
              className="h-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerManualOrchestration({
                apiId: 'comprehensive-healthcare-setup',
                enableRateLimiting: true,
                enableAnalytics: true,
                enableCaching: true,
                cacheTimeoutMs: 300000,
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
              Auto-Setup
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>🔄 Live System Status:</strong> Displaying real-time data from {totalActiveIntegrations} active integrations including 
            Twilio communication services, automated publishing workflows, and comprehensive API key management. 
            All metrics reflect actual system usage and performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoIntegrationBanner;
