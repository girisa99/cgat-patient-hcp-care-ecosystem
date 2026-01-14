/**
 * Market Analysis Tab - Competitors, Trends, Positioning
 * Enterprise design with proper design system tokens
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Globe,
  Monitor, Smartphone, Cloud,
  Star, Check, X, Minus, ArrowUpRight,
  Building2, BarChart3, Target
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  competitors,
  marketTrends,
  marketReferences,
  swotBySegment,
  gartnerPositions,
} from '../data/market-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const MarketAnalysisTab: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState('creators');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-10"
    >
      {/* Market Trends Section */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          AI Video Market Growth Trends (2022-2030)
        </h3>
        <div className="grid grid-cols-4 gap-5 mb-6">
          {marketTrends.slice(0, 4).map((trend, index) => (
            <motion.div 
              key={index} 
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-sm text-muted-foreground mb-1">{trend.year}</div>
              <div className="text-3xl font-bold text-foreground">${trend.globalMarket}B</div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-primary font-medium">AI: {trend.aiAdoption}%</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Growth: {trend.creatorGrowth}%</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Data Sources & References</h4>
          <div className="grid grid-cols-3 gap-4">
            {marketReferences.map((ref, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <ArrowUpRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{ref.source}</span> ({ref.year}): {ref.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Competitor Analysis */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          Key Competitors by Segment
        </h3>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left border-b border-border">
                  <th className="px-4 py-4 text-foreground font-semibold">Competitor</th>
                  <th className="px-4 py-4 text-foreground font-semibold">Segment</th>
                  <th className="px-4 py-4 text-foreground font-semibold">Type</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Users</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Revenue</th>
                  <th className="px-4 py-4 text-foreground font-semibold">Pricing</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Years</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Platforms</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Video Edit</th>
                  <th className="px-4 py-4 text-foreground font-semibold text-center">Ease of Use</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, index) => (
                  <tr 
                    key={index}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-foreground">{comp.name}</td>
                    <td className="px-4 py-4 text-muted-foreground">{comp.segment}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.type === 'Direct' ? 'bg-destructive/10 text-destructive' :
                        comp.type === 'Feature' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {comp.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{comp.userBase}</td>
                    <td className="px-4 py-4 text-center text-green-600 dark:text-green-400 font-medium">{comp.revenue}</td>
                    <td className="px-4 py-4 text-muted-foreground">{comp.pricing}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{comp.yearsInMarket}y</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {comp.platforms.includes('Web') && <Globe className="w-4 h-4 text-primary" />}
                        {comp.platforms.includes('Desktop') && <Monitor className="w-4 h-4 text-blue-500" />}
                        {comp.platforms.includes('Mobile') && <Smartphone className="w-4 h-4 text-green-500" />}
                        {comp.platforms.includes('API') && <Cloud className="w-4 h-4 text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < comp.videoEditingRating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < comp.easeOfUse ? 'text-green-500 fill-green-500' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Competitor Strengths & Weaknesses */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          Competitor Strengths, Weaknesses & Genie Differentiators
        </h3>
        <div className="grid grid-cols-2 gap-5">
          {competitors.slice(0, 6).map((comp, index) => (
            <motion.div 
              key={index} 
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">{comp.name}</h4>
                <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  {comp.learningCurve} to learn
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {comp.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-destructive uppercase mb-2">Weaknesses</h5>
                  <ul className="space-y-1">
                    {comp.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <X className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                <span className="text-xs text-primary font-semibold">Genie Differentiator: </span>
                <span className="text-xs text-foreground">{comp.genieDifferentiator}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gartner-Style Quadrant */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          Market Positioning Matrix (Gartner-Style)
        </h3>
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          <div className="relative h-[400px] border-l-2 border-b-2 border-border ml-16 mb-8">
            {/* Axis Labels */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-muted-foreground text-sm font-medium whitespace-nowrap">
              Ability to Execute →
            </div>
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-muted-foreground text-sm font-medium">
              Completeness of Vision →
            </div>

            {/* Quadrant Labels */}
            <div className="absolute top-4 left-4 text-muted-foreground text-sm">Niche Players</div>
            <div className="absolute top-4 right-4 text-green-600 dark:text-green-400 text-sm font-semibold">Leaders</div>
            <div className="absolute bottom-4 left-4 text-muted-foreground text-sm">Challengers</div>
            <div className="absolute bottom-4 right-4 text-primary text-sm font-semibold">Visionaries</div>

            {/* Quadrant Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />

            {/* Positioned Dots */}
            {Array.isArray(gartnerPositions) && gartnerPositions.map((pos, index) => (
              <motion.div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${pos.visionScore}%`,
                  bottom: `${pos.executionScore}%`,
                }}
                whileHover={{ scale: 1.3 }}
              >
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  pos.name === 'Genie Suite' 
                    ? 'bg-gradient-to-r from-primary to-accent ring-4 ring-primary/30' 
                    : 'bg-muted-foreground/60'
                }`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  {pos.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SWOT Analysis by Segment */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          SWOT Analysis by Target Segment
        </h3>
        <Tabs value={selectedSegment} onValueChange={setSelectedSegment}>
          <TabsList className="bg-muted p-1 mb-6">
            {Object.keys(swotBySegment).map((seg) => (
              <TabsTrigger 
                key={seg} 
                value={seg}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize"
              >
                {seg}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(swotBySegment).map(([segKey, items]) => (
            <TabsContent key={segKey} value={segKey}>
              <div className="grid grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">Strengths</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'strength').map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                            item.impact === 'Medium' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                            'bg-muted text-muted-foreground'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-5 border border-red-200 dark:border-red-800">
                  <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Weaknesses</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'weakness').map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <X className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                            item.impact === 'Medium' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                            'bg-muted text-muted-foreground'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Opportunities */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">Opportunities</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'opportunity').map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' :
                            item.impact === 'Medium' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                            'bg-muted text-muted-foreground'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Threats */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
                  <h4 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-4">Threats</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'threat').map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <Minus className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                            item.impact === 'Medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                            'bg-muted text-muted-foreground'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
