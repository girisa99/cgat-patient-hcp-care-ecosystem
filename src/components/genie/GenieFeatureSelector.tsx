/**
 * GENIE FEATURE SELECTOR
 * Modular feature selection interface for building custom Genie configurations
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Database,
  MessageSquare,
  Heart,
  Shield,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  GenieFeature,
  GenieFeatureCategory,
  GENIE_FEATURE_CATALOG,
  getFeaturesByCategory,
  validateFeatureDependencies,
} from '@/types/genie-features';
import { motion, AnimatePresence } from 'framer-motion';

interface GenieFeatureSelectorProps {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
  onValidate?: (valid: boolean) => void;
}

const CATEGORY_ICONS: Record<GenieFeatureCategory, any> = {
  ai_architecture: Brain,
  conversation: MessageSquare,
  healthcare: Heart,
  infrastructure: Database,
  integration: Zap,
  security: Shield,
  advanced: Star,
};

const CATEGORY_LABELS: Record<GenieFeatureCategory, string> = {
  ai_architecture: 'AI Architecture',
  conversation: 'Conversation',
  healthcare: 'Healthcare',
  infrastructure: 'Infrastructure',
  integration: 'Integration',
  security: 'Security',
  advanced: 'Advanced',
};

export const GenieFeatureSelector: React.FC<GenieFeatureSelectorProps> = ({
  selectedFeatures,
  onChange,
  onValidate,
}) => {
  const [activeCategory, setActiveCategory] = useState<GenieFeatureCategory>('ai_architecture');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    missingDependencies: string[];
  }>({ valid: true, missingDependencies: [] });

  useEffect(() => {
    const result = validateFeatureDependencies(selectedFeatures);
    setValidationResult(result);
    onValidate?.(result.valid);
  }, [selectedFeatures, onValidate]);

  const handleToggleFeature = (featureId: string) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
    onChange(newFeatures);
  };

  const handleSelectPreset = (preset: 'basic' | 'standard' | 'premium' | 'healthcare') => {
    let presetFeatures: string[] = [];

    switch (preset) {
      case 'basic':
        presetFeatures = ['multi_model_intelligence', 'conversation_management', 'edge_functions'];
        break;
      case 'standard':
        presetFeatures = [
          'multi_model_intelligence',
          'advanced_rag',
          'conversation_management',
          'streaming_responses',
          'edge_functions',
          'database_architecture',
          'context_management',
        ];
        break;
      case 'premium':
        presetFeatures = GENIE_FEATURE_CATALOG.filter(f => !f.isPremium).map(f => f.id);
        break;
      case 'healthcare':
        presetFeatures = [
          'multi_model_intelligence',
          'advanced_rag',
          'conversation_management',
          'streaming_responses',
          'clinical_knowledge',
          'hipaa_compliance',
          'patient_support',
          'patient_onboarding',
          'edge_functions',
          'database_architecture',
          'advanced_security',
          'rate_limiting',
        ];
        break;
    }

    onChange(presetFeatures);
  };

  const renderFeatureCard = (feature: GenieFeature) => {
    const isSelected = selectedFeatures.includes(feature.id);
    const hasMissingDeps = feature.dependencies?.some(
      dep => !selectedFeatures.includes(dep)
    );

    return (
      <motion.div
        key={feature.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`cursor-pointer transition-all ${
            isSelected ? 'border-primary shadow-md' : 'hover:shadow-sm'
          }`}
          onClick={() => handleToggleFeature(feature.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {feature.name}
                  {feature.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {feature.description}
                </CardDescription>
              </div>
              <Switch
                checked={isSelected}
                onCheckedChange={() => handleToggleFeature(feature.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </CardHeader>
          {feature.dependencies && feature.dependencies.length > 0 && (
            <CardContent className="pt-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Requires:{' '}
                {feature.dependencies.map((depId, idx) => {
                  const depFeature = GENIE_FEATURE_CATALOG.find(f => f.id === depId);
                  const isDepSelected = selectedFeatures.includes(depId);
                  return (
                    <Badge
                      key={depId}
                      variant={isDepSelected ? 'default' : 'destructive'}
                      className="text-xs mx-1"
                    >
                      {depFeature?.name || depId}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    );
  };

  const categories: GenieFeatureCategory[] = [
    'ai_architecture',
    'conversation',
    'healthcare',
    'infrastructure',
    'integration',
    'security',
    'advanced',
  ];

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Presets</CardTitle>
          <CardDescription>
            Select a preset configuration to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => handleSelectPreset('basic')}>
              Basic
            </Button>
            <Button variant="outline" onClick={() => handleSelectPreset('standard')}>
              Standard
            </Button>
            <Button variant="outline" onClick={() => handleSelectPreset('premium')}>
              <Star className="h-4 w-4 mr-2" />
              Premium
            </Button>
            <Button variant="outline" onClick={() => handleSelectPreset('healthcare')}>
              <Heart className="h-4 w-4 mr-2" />
              Healthcare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Alert */}
      {!validationResult.valid && validationResult.missingDependencies.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing required dependencies:{' '}
            {validationResult.missingDependencies
              .map(id => GENIE_FEATURE_CATALOG.find(f => f.id === id)?.name || id)
              .join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {selectedFeatures.length} features selected
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange([])}
              disabled={selectedFeatures.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as GenieFeatureCategory)}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const categoryFeatures = getFeaturesByCategory(category);
            const selectedCount = categoryFeatures.filter(f =>
              selectedFeatures.includes(f.id)
            ).length;

            return (
              <TabsTrigger key={category} value={category} className="flex flex-col gap-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{CATEGORY_LABELS[category]}</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1">
                    {selectedCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <AnimatePresence mode="wait">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFeaturesByCategory(category).map((feature) =>
                  renderFeatureCard(feature)
                )}
              </div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
