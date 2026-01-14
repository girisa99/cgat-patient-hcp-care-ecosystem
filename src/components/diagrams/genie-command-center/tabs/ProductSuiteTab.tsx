/**
 * Product Suite Tab - Genie Products with Features & WoW Factors
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Mic, Workflow, Zap, Target,
  Check, Star, ArrowRight, Layers, Users,
  Play, FileText, Settings, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { products } from '../data/implementation-data';

const productIcons: Record<string, React.ReactNode> = {
  mind: <Brain className="w-8 h-8" />,
  ask: <Sparkles className="w-8 h-8" />,
  vibe: <Mic className="w-8 h-8" />,
  arc: <Workflow className="w-8 h-8" />,
  spark: <Zap className="w-8 h-8" />,
  hub: <Target className="w-8 h-8" />,
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
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <h2 className="text-3xl font-bold text-white mb-3">
          The Genie Suite Product Family
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Six integrated products that work together seamlessly to power your entire content production workflow.
        </p>
      </motion.div>

      {/* Product Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            layoutId={product.id}
            onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
            className={`relative bg-slate-800/50 rounded-2xl p-6 border cursor-pointer transition-all
              ${selectedProduct === product.id 
                ? 'border-violet-500 ring-2 ring-violet-500/20' 
                : 'border-slate-700/50 hover:border-slate-600'
              }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <Badge className={`${
                product.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                product.status === 'partial' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {product.status === 'complete' ? '✓ Complete' : 
                 product.status === 'partial' ? 'In Progress' : 'Planned'}
              </Badge>
            </div>

            {/* Icon & Title */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${product.color}20` }}
            >
              <div style={{ color: product.color }}>
                {productIcons[product.id]}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
            <p className="text-sm text-violet-400 font-medium mb-3">{product.tagline}</p>
            <p className="text-sm text-slate-300 mb-4 line-clamp-2">{product.description}</p>

            {/* WoW Features */}
            <div className="space-y-2 mb-4">
              {product.wowFeatures.slice(0, 2).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{product.scenariosCovered}</div>
                <div className="text-xs text-slate-400">Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-violet-400">{product.agents.length}</div>
                <div className="text-xs text-slate-400">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">{product.apis.length}</div>
                <div className="text-xs text-slate-400">APIs</div>
              </div>
            </div>

            {/* Expand Indicator */}
            <div className="flex items-center justify-center mt-4 text-slate-400 text-sm">
              <span>{selectedProduct === product.id ? 'Click to collapse' : 'Click for details'}</span>
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${selectedProduct === product.id ? 'rotate-90' : ''}`} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Expanded Product Details */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden"
          >
            {(() => {
              const product = products.find(p => p.id === selectedProduct);
              if (!product) return null;
              
              return (
                <div className="p-8">
                  <div className="grid grid-cols-3 gap-8">
                    {/* All WoW Features */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        WoW Features
                      </h4>
                      <ul className="space-y-3">
                        {product.wowFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                            <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span className="text-amber-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Agents */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        AI Agents Powering {product.name}
                      </h4>
                      <ul className="space-y-2">
                        {product.agents.map((agent, idx) => (
                          <li key={idx} className="flex items-center gap-3 bg-violet-500/10 rounded-lg p-3 border border-violet-500/20">
                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-violet-400" />
                            </div>
                            <span className="text-violet-200 font-mono text-sm">{agent}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* APIs & Edge Functions */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-400" />
                        Backend APIs
                      </h4>
                      <ul className="space-y-2">
                        {product.apis.map((api, idx) => (
                          <li key={idx} className="flex items-center gap-3 bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-emerald-200 font-mono text-sm">{api}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integration Flow */}
      <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">
          Seamless Product Integration Flow
        </h3>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { name: 'Spark', icon: <Zap className="w-6 h-6" />, color: 'hsl(199, 89%, 48%)', desc: 'Quick Start' },
            { name: 'Mind', icon: <Brain className="w-6 h-6" />, color: 'hsl(258, 90%, 66%)', desc: 'Script' },
            { name: 'Vibe', icon: <Mic className="w-6 h-6" />, color: 'hsl(350, 70%, 50%)', desc: 'Record' },
            { name: 'Arc', icon: <Workflow className="w-6 h-6" />, color: 'hsl(160, 84%, 39%)', desc: 'Automate' },
            { name: 'Hub', icon: <Target className="w-6 h-6" />, color: 'hsl(215, 16%, 47%)', desc: 'Manage' },
          ].map((item, index, arr) => (
            <React.Fragment key={item.name}>
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${item.color}30`, color: item.color }}
                >
                  {item.icon}
                </div>
                <span className="text-white font-medium">{item.name}</span>
                <span className="text-xs text-slate-400">{item.desc}</span>
              </div>
              {index < arr.length - 1 && (
                <ArrowRight className="w-6 h-6 text-slate-500" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 rounded-full px-4 py-2 border border-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-medium">Ask Genie</span>
            <span className="text-slate-400">guides you through every step</span>
          </div>
        </div>
      </motion.div>

      {/* Total Stats */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-5 gap-4"
      >
        {[
          { label: 'Total Scenarios', value: '289', color: 'violet' },
          { label: 'AI Agents', value: '15+', color: 'purple' },
          { label: 'Edge Functions', value: '140+', color: 'emerald' },
          { label: 'Custom Hooks', value: '280+', color: 'blue' },
          { label: 'Database Tables', value: '180+', color: 'amber' },
        ].map((stat, index) => (
          <div 
            key={index}
            className={`bg-${stat.color}-500/10 rounded-xl p-5 border border-${stat.color}-500/20 text-center`}
            style={{ 
              backgroundColor: `hsl(var(--${stat.color === 'violet' ? 'primary' : stat.color === 'emerald' ? 'chart-4' : stat.color === 'amber' ? 'chart-3' : 'chart-5'}) / 0.1)`,
              borderColor: `hsl(var(--${stat.color === 'violet' ? 'primary' : stat.color === 'emerald' ? 'chart-4' : stat.color === 'amber' ? 'chart-3' : 'chart-5'}) / 0.2)`
            }}
          >
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
