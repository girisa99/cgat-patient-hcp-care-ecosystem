/**
 * Genie P3 Integration Dashboard
 * Cross-functional P3 components integrated view
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Scale,
  Layers,
  Users,
  BarChart3,
  Store,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Shield,
  Zap,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy import P3 components
const LegalReviewGate = React.lazy(() => import('@/components/legal/LegalReviewGate'));
const BulkOperationsManager = React.lazy(() => import('@/components/bulk/BulkOperationsManager'));
const WorkspaceCollaboration = React.lazy(() => import('@/components/collaboration/WorkspaceCollaboration'));
const AdvancedAnalyticsDashboard = React.lazy(() => import('@/components/analytics/AdvancedAnalyticsDashboard'));
const TemplateMarketplace = React.lazy(() => import('@/components/marketplace/TemplateMarketplace'));

interface P3Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  status: 'complete' | 'beta' | 'alpha';
  crossFunctional: string[];
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

const p3Features: P3Feature[] = [
  {
    id: 'legal-review',
    name: 'Legal Review Gate',
    description: 'Compliance review workflow for content approval',
    icon: Scale,
    color: 'from-red-500 to-pink-500',
    status: 'complete',
    crossFunctional: ['Genie Mind', 'Genie Vibe', 'Genie Arc'],
    component: LegalReviewGate
  },
  {
    id: 'bulk-operations',
    name: 'Bulk Operations',
    description: 'Batch processing and bulk upload management',
    icon: Layers,
    color: 'from-blue-500 to-cyan-500',
    status: 'complete',
    crossFunctional: ['All Products'],
    component: BulkOperationsManager
  },
  {
    id: 'workspace',
    name: 'Workspace Collaboration',
    description: 'Team management, invitations, and activity tracking',
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    status: 'complete',
    crossFunctional: ['All Products'],
    component: WorkspaceCollaboration
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Enterprise analytics dashboard and reporting',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-500',
    status: 'complete',
    crossFunctional: ['Genie Mind', 'Genie Vibe', 'Genie Spark', 'Genie Arc'],
    component: AdvancedAnalyticsDashboard
  },
  {
    id: 'marketplace',
    name: 'Template Marketplace',
    description: 'Template store with reviews and installations',
    icon: Store,
    color: 'from-amber-500 to-orange-500',
    status: 'complete',
    crossFunctional: ['Genie Arc', 'Genie Spark'],
    component: TemplateMarketplace
  }
];

const crossFunctionalMatrix = [
  { product: 'Genie Mind', features: ['Legal Review Gate', 'Bulk Operations', 'Workspace Collaboration', 'Advanced Analytics'] },
  { product: 'Genie Vibe', features: ['Legal Review Gate', 'Bulk Operations', 'Workspace Collaboration', 'Advanced Analytics'] },
  { product: 'Genie Spark', features: ['Bulk Operations', 'Workspace Collaboration', 'Advanced Analytics', 'Template Marketplace'] },
  { product: 'Genie Arc', features: ['Legal Review Gate', 'Bulk Operations', 'Workspace Collaboration', 'Advanced Analytics', 'Template Marketplace'] },
  { product: 'Production Hub', features: ['Bulk Operations', 'Workspace Collaboration', 'Advanced Analytics'] },
];

export const GenieP3IntegrationDashboard: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>('overview');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const selectedFeature = p3Features.find(f => f.id === activeFeature);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            P3 Enterprise Features
          </h2>
          <p className="text-slate-400 text-sm">
            Cross-functional enterprise capabilities integrated across all products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            5/5 Complete
          </Badge>
          <Badge variant="outline" className="text-purple-300 border-purple-500/30">
            <Package className="h-3 w-3 mr-1" />
            11 Tables
          </Badge>
          <Badge variant="outline" className="text-blue-300 border-blue-500/30">
            <Zap className="h-3 w-3 mr-1" />
            5 Functions
          </Badge>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {p3Features.map((feature) => (
          <Card
            key={feature.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105",
              "bg-slate-900/50 border-slate-700/50 hover:border-violet-500/50",
              activeFeature === feature.id && "border-violet-500 ring-2 ring-violet-500/20"
            )}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={cn(
                "h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                "bg-gradient-to-br", feature.color
              )}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div className="font-medium text-white text-sm">{feature.name}</div>
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-2 text-[10px]",
                  feature.status === 'complete' && "text-emerald-400 border-emerald-500/30",
                  feature.status === 'beta' && "text-amber-400 border-amber-500/30"
                )}
              >
                {feature.status === 'complete' ? 'Complete' : 'Beta'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeFeature === 'overview' ? 'overview' : 'feature'} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger 
            value="overview" 
            onClick={() => setActiveFeature('overview')}
            className="data-[state=active]:bg-violet-600"
          >
            Cross-Functional Matrix
          </TabsTrigger>
          <TabsTrigger 
            value="feature" 
            className="data-[state=active]:bg-violet-600"
            disabled={activeFeature === 'overview'}
          >
            {selectedFeature?.name || 'Select Feature'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Cross-Functional Integration Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-400">Product</th>
                      {p3Features.map(f => (
                        <th key={f.id} className="text-center p-3 text-slate-400">
                          <f.icon className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">{f.name.split(' ')[0]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {crossFunctionalMatrix.map((row) => (
                      <tr key={row.product} className="border-b border-slate-800">
                        <td className="p-3 text-white font-medium">{row.product}</td>
                        {p3Features.map(f => (
                          <td key={f.id} className="text-center p-3">
                            {row.features.includes(f.name) ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Detail Tab */}
        <TabsContent value="feature" className="mt-4">
          {selectedFeature && (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br", selectedFeature.color
                    )}>
                      <selectedFeature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{selectedFeature.name}</CardTitle>
                      <p className="text-sm text-slate-400">{selectedFeature.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="gap-2"
                  >
                    {showLivePreview ? 'Hide Preview' : 'Live Preview'}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Feature Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {selectedFeature.status === 'complete' ? 'Production Ready' : 'Beta'}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Used In</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedFeature.crossFunctional.map(cf => (
                        <Badge key={cf} variant="outline" className="text-xs text-slate-300">
                          {cf}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">Integration</div>
                    <div className="text-white text-sm font-medium">Edge Function + UI</div>
                  </div>
                </div>

                {/* Live Preview */}
                {showLivePreview && (
                  <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Live Component Preview</span>
                      <Badge variant="outline" className="text-xs text-violet-400">
                        Interactive
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-900/80 max-h-[500px] overflow-auto">
                      <React.Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                        </div>
                      }>
                        <selectedFeature.component />
                      </React.Suspense>
                    </div>
                  </div>
                )}

                {!showLivePreview && (
                  <div className="text-center py-12 text-slate-500">
                    <selectedFeature.icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Live Preview" to see the component in action</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Implementation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">11</div>
            <div className="text-xs text-slate-400">Database Tables</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-xs text-slate-400">Edge Functions</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-xs text-slate-400">UI Components</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-slate-400">P3 Complete</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieP3IntegrationDashboard;
