/**
 * Roadmap Tab - P0-P5 Implementation Status
 * Enterprise design with proper design system tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Circle,
  Layers, Target, Rocket
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { implementationPhases, scenarioCategories } from '../data/implementation-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    default:
      return <Circle className="w-5 h-5 text-muted-foreground" />;
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20';
    case 'in-progress':
      return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20';
    default:
      return 'border-border bg-muted/30';
  }
};

export const RoadmapTab: React.FC = () => {
  const totalScenarios = implementationPhases.reduce((acc, p) => acc + p.scenariosTotal, 0);
  const completedScenarios = implementationPhases.reduce((acc, p) => acc + p.scenariosComplete, 0);
  const overallProgress = Math.round((completedScenarios / totalScenarios) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-10"
    >
      {/* Overall Progress */}
      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Rocket className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Implementation Roadmap</h2>
              <p className="text-muted-foreground mt-1">P0-P5 Phase Progress Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-foreground"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {totalScenarios}
              </motion.div>
              <div className="text-sm text-muted-foreground">Total Scenarios</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-green-600 dark:text-green-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {completedScenarios}
              </motion.div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-primary"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {overallProgress}%
              </motion.div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </motion.div>

      {/* Phase Cards */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          Implementation Phases
        </h3>
        <div className="grid grid-cols-3 gap-5">
          {implementationPhases.map((phase, index) => (
            <motion.div
              key={phase.id}
              className={`rounded-2xl p-5 border ${getStatusStyles(phase.status)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(phase.status)}
                  <div>
                    <h4 className="font-semibold text-foreground">{phase.name}</h4>
                    <p className="text-xs text-muted-foreground">{phase.weeks}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    phase.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    phase.status === 'in-progress' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                  }`}>
                    {phase.completion}%
                  </div>
                </div>
              </div>
              
              <Progress value={phase.completion} className="h-2 mb-4" />
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Scenarios</span>
                <span className="text-foreground font-medium">
                  {phase.scenariosComplete} / {phase.scenariosTotal}
                </span>
              </div>
              
              <div className="space-y-2">
                {phase.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {feature.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : feature.status === 'partial' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted" />
                    )}
                    <span className={feature.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scenario Categories */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          Scenario Categories Breakdown
        </h3>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-foreground font-semibold px-4 py-4">Category</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Range</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Total</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Implemented</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Partial</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Pending</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Phase</th>
                <th className="text-center text-foreground font-semibold px-4 py-4">Progress</th>
              </tr>
            </thead>
            <tbody>
              {scenarioCategories.map((cat, index) => {
                const progress = Math.round(((cat.implemented + cat.partial * 0.5) / cat.total) * 100);
                return (
                  <tr 
                    key={index}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-foreground font-medium">{cat.name}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{cat.range}</td>
                    <td className="px-4 py-4 text-center text-foreground font-medium">{cat.total}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                        {cat.implemented}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                        {cat.partial}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        {cat.pending}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cat.phase.includes('P0') || cat.phase.includes('P1') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        cat.phase.includes('P2') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {cat.phase}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-8 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-5 h-5 text-muted" />
          <span className="text-sm text-muted-foreground">Planned</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
