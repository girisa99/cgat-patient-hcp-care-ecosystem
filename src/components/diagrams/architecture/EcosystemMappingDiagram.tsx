/**
 * ECOSYSTEM MAPPING DIAGRAM
 * 
 * Visual representation of the complete Genie ecosystem:
 * - 7 Products
 * - 21 Pipeline Categories
 * - 206 Pipelines
 * - 25 Cross-Functional Capabilities
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, Zap, Brain, Film, Presentation, Users, Radio, 
  Sparkles, Check, ArrowRight, Database, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import from ecosystem registry
import { GENIE_PRODUCTS, GenieProduct, PRODUCT_KEYS } from '@/constants/genie-products';
import { PIPELINE_CATEGORY_MAPPING, PRODUCT_PIPELINE_SUMMARY } from '@/constants/pipelineProductMapping';
import { CROSS_FUNCTIONAL_CAPABILITIES, CapabilityCategory } from '@/constants/crossFunctionalCapabilities';
import { CATEGORY_REGISTRY, getEcosystemSummary } from '@/constants/ecosystemRegistry';

const productIcons: Record<GenieProduct, React.ReactNode> = {
  spark: <Zap className="w-5 h-5" />,
  mind: <Brain className="w-5 h-5" />,
  vibe: <Film className="w-5 h-5" />,
  deck: <Presentation className="w-5 h-5" />,
  hub: <Users className="w-5 h-5" />,
  arc: <Users className="w-5 h-5" />,
  cast: <Radio className="w-5 h-5" />,
  studio: <Sparkles className="w-5 h-5" />,
};

const productColors: Record<GenieProduct, string> = {
  spark: 'from-amber-500 to-orange-500',
  mind: 'from-blue-500 to-cyan-500',
  vibe: 'from-purple-500 to-pink-500',
  deck: 'from-violet-500 to-purple-500',
  hub: 'from-emerald-500 to-teal-500',
  arc: 'from-emerald-500 to-teal-500',
  cast: 'from-pink-500 to-rose-500',
  studio: 'from-indigo-500 to-violet-500',
};

export const EcosystemMappingDiagram: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<GenieProduct | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const ecosystemSummary = getEcosystemSummary();
  
  // Group categories by product
  const categoriesByProduct = PRODUCT_KEYS.reduce((acc, product) => {
    acc[product] = PIPELINE_CATEGORY_MAPPING.filter(
      cat => cat.primaryProduct === product
    );
    return acc;
  }, {} as Record<GenieProduct, typeof PIPELINE_CATEGORY_MAPPING>);
  
  // Group capabilities by category
  const capabilitiesByCategory = Object.keys({
    avatar: 0, immersive: 0, audio: 0, video: 0, localization: 0, collaboration: 0, distribution: 0
  } as Record<CapabilityCategory, number>).reduce((acc, cat) => {
    acc[cat as CapabilityCategory] = CROSS_FUNCTIONAL_CAPABILITIES.filter(
      c => c.category === cat
    );
    return acc;
  }, {} as Record<CapabilityCategory, typeof CROSS_FUNCTIONAL_CAPABILITIES>);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Ecosystem Mapping
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                {ecosystemSummary.validation.isValid ? 'Verified' : 'Issues'}
              </Badge>
            </h2>
            <p className="text-muted-foreground">7 Products • 21 Categories • 206 Pipelines • 25 Capabilities</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {PRODUCT_KEYS.filter(p => p !== 'studio').map(product => {
          const info = GENIE_PRODUCTS[product];
          const summary = PRODUCT_PIPELINE_SUMMARY[product];
          return (
            <motion.div
              key={product}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedProduct(selectedProduct === product ? null : product)}
            >
              <Card className={`cursor-pointer transition-all ${
                selectedProduct === product ? 'ring-2 ring-primary' : 'hover:border-primary/50'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${productColors[product]} flex items-center justify-center text-white mb-2`}>
                    {productIcons[product]}
                  </div>
                  <div className="font-semibold text-sm">{info.name.replace('Genie ', '')}</div>
                  <div className="text-2xl font-bold text-primary">{summary.primaryPipelines}</div>
                  <div className="text-xs text-muted-foreground">pipelines</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">21 Categories</TabsTrigger>
          <TabsTrigger value="capabilities">25 Capabilities</TabsTrigger>
          <TabsTrigger value="matrix">Mapping Matrix</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Flow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Production Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {['spark', 'mind', 'vibe', 'deck', 'arc', 'cast'].map((product, idx) => {
                    const info = GENIE_PRODUCTS[product as GenieProduct];
                    return (
                      <div key={product} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${productColors[product as GenieProduct]} flex items-center justify-center text-white text-sm font-bold`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{info.name}</div>
                          <div className="text-xs text-muted-foreground">{info.tagline}</div>
                        </div>
                        {idx < 5 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PRODUCT_KEYS.filter(p => p !== 'studio').map(product => {
                  const info = GENIE_PRODUCTS[product];
                  const summary = PRODUCT_PIPELINE_SUMMARY[product];
                  const percentage = (summary.primaryPipelines / 206) * 100;
                  return (
                    <div key={product}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{info.name.replace('Genie ', '')}</span>
                        <span className="font-medium">{summary.primaryPipelines} pipelines</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {Object.entries(CATEGORY_REGISTRY).map(([catId, config]) => (
                <Card key={catId} className="border-l-4" style={{ 
                  borderLeftColor: `hsl(var(--${config.product === 'spark' ? 'warning' : config.product === 'mind' ? 'info' : config.product === 'vibe' ? 'accent' : config.product === 'deck' ? 'primary' : config.product === 'arc' ? 'success' : 'destructive'}))` 
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{catId}</code>
                      <Badge variant="outline" className="text-xs">
                        {config.pipelines} pipelines
                      </Badge>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {GENIE_PRODUCTS[config.product as GenieProduct].name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {config.edgeFunction}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {Object.entries(capabilitiesByCategory).map(([category, capabilities]) => (
                capabilities.length > 0 && (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{category} ({capabilities.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {capabilities.map(cap => (
                        <Card key={cap.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium">{cap.name}</div>
                              <Badge variant={
                                cap.tier === 'free' ? 'outline' : 
                                cap.tier === 'pro' ? 'secondary' : 'default'
                              }>
                                {cap.tier}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{cap.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {cap.compatibleProducts.map(p => (
                                <Badge key={p} variant="outline" className="text-xs">
                                  {GENIE_PRODUCTS[p].name.replace('Genie ', '')}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Providers: {cap.primaryProviders.join(', ')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product × Category Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Category</th>
                        {PRODUCT_KEYS.filter(p => p !== 'studio').map(p => (
                          <th key={p} className="text-center p-2 font-medium">
                            {GENIE_PRODUCTS[p].name.replace('Genie ', '')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PIPELINE_CATEGORY_MAPPING.map(cat => (
                        <tr key={cat.categoryId} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <code className="text-xs">{cat.categoryId}</code>
                            <div className="text-xs text-muted-foreground">{cat.pipelineCount} pipelines</div>
                          </td>
                          {PRODUCT_KEYS.filter(p => p !== 'studio').map(p => (
                            <td key={p} className="text-center p-2">
                              {cat.primaryProduct === p ? (
                                <span className="inline-flex w-6 h-6 rounded-full bg-primary text-primary-foreground items-center justify-center text-xs font-bold">●</span>
                              ) : cat.sharedProducts.includes(p) ? (
                                <span className="inline-flex w-6 h-6 rounded-full bg-muted text-muted-foreground items-center justify-center text-xs">○</span>
                              ) : (
                                <span className="text-muted-foreground/30">–</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary" />
                  <span>Primary Owner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-muted border" />
                  <span>Shared Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcosystemMappingDiagram;
