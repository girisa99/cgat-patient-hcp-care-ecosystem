
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
import { useEnhancedApiKeyMonitor } from '@/hooks/useEnhancedApiKeyMonitor';

const AutoIntegrationBanner = () => {
  const {
    orchestrationResults,
    isOrchestrating,
    triggerManualOrchestration,
    isManualTriggering
  } = useApiConsumptionTrigger();
  
  const { apiKeys } = useApiKeys();
  const { metrics } = useEnhancedApiKeyMonitor();

  const getOverallStatus = () => {
    const recentKeys = apiKeys?.filter(key => 
      new Date(key.created_at) > new Date(Date.now() - 300000) // 5 minutes
    ).length || 0;

    const totalIntegrations = metrics.categoryBreakdown ? 
      Object.values(metrics.categoryBreakdown).reduce((sum, count) => sum + count, 0) : 0;

    if (recentKeys > 0) {
      return { 
        status: 'auto-active', 
        message: `${recentKeys} API key${recentKeys > 1 ? 's' : ''} activated`, 
        color: 'default' 
      };
    }

    if (totalIntegrations > 10000) {
      return { 
        status: 'enterprise-active', 
        message: `${totalIntegrations.toLocaleString()} integrations active`, 
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
    }
  };

  const getComprehensiveStats = () => {
    const apiKeyCount = apiKeys?.length || 0;
    const recentApiKeys = apiKeys?.filter(key => 
      new Date(key.created_at) > new Date(Date.now() - 300000)
    ).length || 0;

    const categoryStats = metrics.categoryBreakdown || {};
    const complianceStats = metrics.complianceMetrics || {};

    if (!orchestrationResults || orchestrationResults.length === 0) {
      return {
        schemas: recentApiKeys,
        policies: recentApiKeys,
        mappings: recentApiKeys,
        modules: recentApiKeys,
        types: recentApiKeys,
        docs: recentApiKeys,
        apiKeys: apiKeyCount,
        treatmentCenters: categoryStats.treatment_center || 0,
        pharmaBiotech: categoryStats.pharma_biotech || 0,
        financialVerification: categoryStats.financial_verification || 0,
        hipaaCompliant: complianceStats.hipaa_compliant || 0,
        fdaCompliant: complianceStats.fda_compliant || 0,
        pciCompliant: complianceStats.pci_compliant || 0
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
      treatmentCenters: categoryStats.treatment_center || 0,
      pharmaBiotech: categoryStats.pharma_biotech || 0,
      financialVerification: categoryStats.financial_verification || 0,
      hipaaCompliant: complianceStats.hipaa_compliant || 0,
      fdaCompliant: complianceStats.fda_compliant || 0,
      pciCompliant: complianceStats.pci_compliant || 0
    }), { 
      schemas: 0, policies: 0, mappings: 0, modules: 0, types: 0, docs: 0, 
      apiKeys: apiKeyCount, treatmentCenters: 0, pharmaBiotech: 0, financialVerification: 0,
      hipaaCompliant: 0, fdaCompliant: 0, pciCompliant: 0
    });
  };

  const overallStatus = getOverallStatus();
  const stats = getComprehensiveStats();
  const totalTechnicalComponents = stats.schemas + stats.policies + stats.mappings + stats.modules + stats.types + stats.docs;
  const totalActiveIntegrations = stats.treatmentCenters + stats.pharmaBiotech + stats.financialVerification;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Smart Healthcare API Integration Platform</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive API management for treatment centers, pharma/biotech, and financial verification
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

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Treatment Centers</p>
                    <p className="text-sm text-muted-foreground">EHR, Pharmacy, Clinical</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{stats.treatmentCenters.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active APIs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold">Pharma & Biotech</p>
                    <p className="text-sm text-muted-foreground">LIMS, CTMS, Research</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{stats.pharmaBiotech.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active APIs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Financial Verification</p>
                    <p className="text-sm text-muted-foreground">Credit, Payment, Insurance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{stats.financialVerification.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active APIs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Components */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mb-6">
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
            <p className="text-xs text-muted-foreground">Security</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <RefreshCw className="h-4 w-4 text-purple-600 mr-1" />
              <span className="font-semibold text-lg">{stats.mappings}</span>
            </div>
            <p className="text-xs text-muted-foreground">Mapp.</p>
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

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-lg text-blue-600">{stats.hipaaCompliant.toLocaleString()}</span>
            </div>
            <p className="text-xs text-blue-700">HIPAA Compliant APIs</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FlaskConical className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-lg text-purple-600">{stats.fdaCompliant.toLocaleString()}</span>
            </div>
            <p className="text-xs text-purple-700">FDA Compliant APIs</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-lg text-green-600">{stats.pciCompliant.toLocaleString()}</span>
            </div>
            <p className="text-xs text-green-700">PCI Compliant APIs</p>
          </div>
        </div>

        {/* Progress and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Integration Platform Progress</span>
              <span>{totalActiveIntegrations.toLocaleString()} active integrations</span>
            </div>
            <Progress 
              value={totalActiveIntegrations > 0 ? Math.min(100, (totalActiveIntegrations / 1000) * 100) : 0} 
              className="h-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerManualOrchestration({
                apiId: 'comprehensive-healthcare-setup',
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

        {/* Enhanced Notice */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>🏥 Healthcare Integration Platform:</strong> Comprehensive API management for treatment centers, 
            pharmaceutical companies, biotech research facilities, and financial verification services. 
            Automatically handles HIPAA, FDA 21 CFR Part 11, PCI DSS compliance, and clinical data standards 
            (FHIR, HL7, LOINC, SNOMED CT).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoIntegrationBanner;
