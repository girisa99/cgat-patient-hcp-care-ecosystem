/**
 * ENROLLMENT FEATURE SELECTOR
 * Specialized feature selector for enrollment agent configuration
 * P1 Implementation: Wire enrollment agents to GenieFeatureSelector system
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Brain,
  UserCheck,
  Shield,
  FileText,
  CreditCard,
  Activity,
  Zap,
  MessageCircle,
  Mic,
  Database,
  Sparkles,
  Star,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useEnrollmentAgentConfig, EnrollmentAgentConfig, ENROLLMENT_FEATURE_IDS } from '@/hooks/useEnrollmentAgentConfig';
import { GENIE_FEATURE_CATALOG } from '@/types/genie-features';
import { motion } from 'framer-motion';

interface EnrollmentFeatureSelectorProps {
  deploymentId?: string;
  onConfigChange?: (config: EnrollmentAgentConfig) => void;
  compact?: boolean;
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  patient_onboarding: <UserCheck className="h-4 w-4" />,
  npi_verification: <Shield className="h-4 w-4" />,
  credentialing_workflow: <Shield className="h-4 w-4" />,
  consent_management: <FileText className="h-4 w-4" />,
  insurance_verification: <CreditCard className="h-4 w-4" />,
  clinical_assessment: <Activity className="h-4 w-4" />,
  multi_model_intelligence: <Brain className="h-4 w-4" />,
  advanced_rag: <Database className="h-4 w-4" />,
  streaming_responses: <Zap className="h-4 w-4" />,
  clinical_knowledge: <Activity className="h-4 w-4" />,
  hipaa_compliance: <Shield className="h-4 w-4" />,
  smart_field_routing: <Database className="h-4 w-4" />,
  real_time_validation: <Zap className="h-4 w-4" />,
  enrollment_personality: <Sparkles className="h-4 w-4" />,
  whatsapp_integration: <MessageCircle className="h-4 w-4" />,
  voice_enrollment: <Mic className="h-4 w-4" />,
  document_generation: <FileText className="h-4 w-4" />,
};

export const EnrollmentFeatureSelector: React.FC<EnrollmentFeatureSelectorProps> = ({
  deploymentId,
  onConfigChange,
  compact = false,
}) => {
  const {
    enabledFeatures,
    personalityMode,
    aiProvider,
    isValid,
    config,
    enrollmentFeatures,
    toggleFeature,
    setPersonalityMode,
    setAiProvider,
    applyPreset,
    isFeatureEnabled,
    isLoading,
  } = useEnrollmentAgentConfig(deploymentId);

  // Notify parent of config changes
  React.useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const coreFeatures = enrollmentFeatures.filter(f => 
    ['patient_onboarding', 'npi_verification', 'credentialing_workflow', 'consent_management', 'insurance_verification', 'clinical_assessment'].includes(f.id)
  );

  const supportingFeatures = enrollmentFeatures.filter(f =>
    ['multi_model_intelligence', 'advanced_rag', 'streaming_responses', 'clinical_knowledge', 'hipaa_compliance', 'smart_field_routing', 'real_time_validation', 'enrollment_personality'].includes(f.id)
  );

  const premiumFeatures = enrollmentFeatures.filter(f => f.isPremium);

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Feature Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {enabledFeatures.slice(0, 6).map(featureId => {
              const feature = GENIE_FEATURE_CATALOG.find(f => f.id === featureId);
              return (
                <Badge key={featureId} variant="secondary" className="text-xs">
                  {FEATURE_ICONS[featureId]}
                  <span className="ml-1">{feature?.name || featureId}</span>
                </Badge>
              );
            })}
            {enabledFeatures.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{enabledFeatures.length - 6} more
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={personalityMode} onValueChange={(v) => setPersonalityMode(v as any)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
            <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as any)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enrollment Configuration Presets</CardTitle>
          <CardDescription>Quick start with pre-configured feature sets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => applyPreset('basic')}>
              Basic
            </Button>
            <Button variant="outline" onClick={() => applyPreset('standard')}>
              Standard
            </Button>
            <Button variant="outline" onClick={() => applyPreset('comprehensive')}>
              Comprehensive
            </Button>
            <Button variant="outline" onClick={() => applyPreset('healthcare_full')}>
              <Star className="h-4 w-4 mr-2" />
              Full Healthcare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Alert */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some features have missing dependencies. Please review your selection.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Personality Mode</label>
              <Select value={personalityMode} onValueChange={(v) => setPersonalityMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">AI Provider</label>
              <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI GPT</SelectItem>
                  <SelectItem value="claude">Anthropic Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">{enabledFeatures.length} features enabled</span>
            </div>
            <Badge variant={isValid ? 'default' : 'destructive'}>
              {isValid ? 'Valid Configuration' : 'Invalid'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Enrollment Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Core Enrollment Features</CardTitle>
          <CardDescription>Essential features for patient enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coreFeatures.map(feature => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {FEATURE_ICONS[feature.id] || <Zap className="h-4 w-4" />}
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {feature.name}
                      {feature.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
                <Switch
                  checked={isFeatureEnabled(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supporting Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supporting Features</CardTitle>
          <CardDescription>AI and infrastructure capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportingFeatures.map(feature => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {FEATURE_ICONS[feature.id] || <Zap className="h-4 w-4" />}
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <Switch
                  checked={isFeatureEnabled(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      {premiumFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Premium Features
            </CardTitle>
            <CardDescription>Advanced capabilities for enterprise use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {premiumFeatures.map(feature => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20"
                >
                  <div className="flex items-center gap-3">
                    {FEATURE_ICONS[feature.id] || <Star className="h-4 w-4" />}
                    <div>
                      <div className="font-medium text-sm">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={isFeatureEnabled(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
