/**
 * Product Suite Tab - Genie Products with Features & WoW Factors
 * Clean enterprise styling with proper design tokens
 * DYNAMIC DATA: Metrics sourced from governance-data.ts
 * 
 * DISPLAYS: Genie-specific metrics (not platform totals)
 * This is a PRODUCT view for stakeholders interested in Genie Suite only.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Mic, Workflow, Zap, Target,
  Star, ArrowRight, Users, Settings, Globe, ChevronDown, Presentation
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { products, infrastructureMetrics } from '../data/implementation-data';
import { masterScenarioCounts } from '../data/governance-data';
import { GENIE_COUNTS, SCENARIO_METRICS, PLATFORM_TOTALS } from '@/genie-studio/governance';

const productIcons: Record<string, React.ReactNode> = {
  mind: <Brain className="w-8 h-8" />,
  ask: <Sparkles className="w-8 h-8" />,
  vibe: <Mic className="w-8 h-8" />,
  arc: <Workflow className="w-8 h-8" />,
  spark: <Zap className="w-8 h-8" />,
  hub: <Target className="w-8 h-8" />,
  deck: <Presentation className="w-8 h-8" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const ProductSuiteTab: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <h2 className="text-3xl font-bold text-foreground mb-3">
          The Genie Suite Product Family
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Six integrated products that work together seamlessly to power your entire content production workflow.
        </p>
      </motion.div>

      {/* Product Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedProduct === product.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
          >
            <CardHeader className="pb-3">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant={
                  product.status === 'complete' ? 'default' :
                  product.status === 'partial' ? 'secondary' : 'outline'
                } className={
                  product.status === 'complete' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                  product.status === 'partial' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                  'bg-muted text-muted-foreground'
                }>
                  {product.status === 'complete' ? '✓ Complete' : 
                   product.status === 'partial' ? 'In Progress' : 'Planned'}
                </Badge>
              </div>

              {/* Icon & Title */}
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${product.color}15` }}
              >
                <div style={{ color: product.color }}>
                  {productIcons[product.id]}
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
              <p className="text-sm text-primary font-medium">{product.tagline}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

              {/* WoW Features */}
              <div className="space-y-2 mb-4">
                {product.wowFeatures.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{product.scenariosCovered}</div>
                  <div className="text-xs text-muted-foreground">Scenarios</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{product.agents.length}</div>
                  <div className="text-xs text-muted-foreground">AI Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{product.apis.length}</div>
                  <div className="text-xs text-muted-foreground">APIs</div>
                </div>
              </div>

              {/* Expand Indicator */}
              <div className="flex items-center justify-center mt-4 text-muted-foreground text-sm">
                <span>{selectedProduct === product.id ? 'Click to collapse' : 'Click for details'}</span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${selectedProduct === product.id ? 'rotate-180' : ''}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Expanded Product Details */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                {(() => {
                  const product = products.find(p => p.id === selectedProduct);
                  if (!product) return null;
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* All WoW Features */}
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          WoW Features
                        </h4>
                        <ul className="space-y-3">
                          {product.wowFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                              <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <span className="text-foreground text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Agents */}
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          AI Agents Powering {product.name}
                        </h4>
                        <ul className="space-y-2">
                          {product.agents.map((agent, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-foreground font-mono text-sm">{agent}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* APIs & Edge Functions */}
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-green-600" />
                          Backend APIs
                        </h4>
                        <ul className="space-y-2">
                          {product.apis.map((api, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-foreground font-mono text-sm">{api}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integration Flow */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Seamless Product Integration Flow
            </h3>
            <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto pb-4">
              {[
                { name: 'Spark', icon: <Zap className="w-6 h-6" />, color: 'hsl(199, 89%, 48%)', desc: 'Quick Start' },
                { name: 'Mind', icon: <Brain className="w-6 h-6" />, color: 'hsl(258, 90%, 66%)', desc: 'Script' },
                { name: 'Deck', icon: <Presentation className="w-6 h-6" />, color: 'hsl(175, 77%, 45%)', desc: 'Present' },
                { name: 'Vibe', icon: <Mic className="w-6 h-6" />, color: 'hsl(350, 70%, 50%)', desc: 'Record' },
                { name: 'Arc', icon: <Workflow className="w-6 h-6" />, color: 'hsl(160, 84%, 39%)', desc: 'Automate' },
                { name: 'Hub', icon: <Target className="w-6 h-6" />, color: 'hsl(215, 16%, 47%)', desc: 'Manage' },
              ].map((item, index, arr) => (
                <React.Fragment key={item.name}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-foreground font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">Ask Genie</span>
                <span className="text-muted-foreground">guides you through every step</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Genie-Specific Stats - Product View */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Genie Suite Infrastructure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { 
              label: 'Scenarios', 
              genie: SCENARIO_METRICS.implementedScenarios,
              total: SCENARIO_METRICS.totalScenarios,
              color: 'primary',
              showProgress: true,
            },
            { 
              label: 'AI Agents', 
              genie: GENIE_COUNTS.aiAgents,
              total: PLATFORM_TOTALS.aiAgents,
              color: 'purple',
            },
            { 
              label: 'Edge Functions', 
              genie: GENIE_COUNTS.edgeFunctions,
              total: PLATFORM_TOTALS.edgeFunctions,
              color: 'green',
            },
            { 
              label: 'Custom Hooks', 
              genie: GENIE_COUNTS.hooks,
              total: PLATFORM_TOTALS.hooks,
              color: 'blue',
            },
            { 
              label: 'Database Tables', 
              genie: GENIE_COUNTS.databaseTables,
              total: PLATFORM_TOTALS.databaseTables,
              color: 'amber',
            },
          ].map((stat, index) => (
            <Card key={index} className="text-center border-2 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="text-2xl font-bold text-foreground">
                  {stat.genie}
                  <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                <div className="mt-2 text-xs text-primary">
                  {Math.round((stat.genie / stat.total) * 100)}% of platform
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Additional Genie-Specific Metrics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pages', genie: GENIE_COUNTS.pages, total: PLATFORM_TOTALS.pages },
            { label: 'Services', genie: GENIE_COUNTS.services, total: PLATFORM_TOTALS.services },
            { label: 'Components', genie: GENIE_COUNTS.components, total: PLATFORM_TOTALS.components },
            { label: 'Mobile', genie: GENIE_COUNTS.mobileComponents, total: PLATFORM_TOTALS.mobileComponents },
          ].map((stat, index) => (
            <Card key={index} className="text-center bg-muted/30">
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-foreground">
                  {stat.genie}<span className="text-xs text-muted-foreground">/{stat.total}</span>
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
