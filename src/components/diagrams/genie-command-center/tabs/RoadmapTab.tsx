/**
 * Roadmap Tab - P0-P5 Implementation Status
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Circle, AlertCircle,
  TrendingUp, Layers, Target, Rocket
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { implementationPhases, scenarioCategories } from '../data/implementation-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-amber-400" />;
    default:
      return <Circle className="w-5 h-5 text-slate-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/5';
    case 'in-progress':
      return 'border-amber-500/30 bg-amber-500/5';
    default:
      return 'border-slate-600/30 bg-slate-800/30';
  }
};

export const RoadmapTab: React.FC = () => {
  // Calculate totals
  const totalScenarios = implementationPhases.reduce((acc, p) => acc + p.scenariosTotal, 0);
  const completedScenarios = implementationPhases.reduce((acc, p) => acc + p.scenariosComplete, 0);
  const overallProgress = Math.round((completedScenarios / totalScenarios) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Overall Progress */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl p-8 border border-violet-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Implementation Roadmap</h2>
            <p className="text-slate-300 mt-1">P0-P5 Phase Progress Tracking</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{totalScenarios}</div>
              <div className="text-sm text-slate-400">Total Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">{completedScenarios}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-400">{overallProgress}%</div>
              <div className="text-sm text-slate-400">Overall Progress</div>
            </div>
          </div>
        </div>
        <Progress value={overallProgress} className="h-4 bg-slate-700" />
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>P0: Core MVP</span>
          <span>P1: Essential</span>
          <span>P2: AI Agents</span>
          <span>P3: Enterprise</span>
          <span>P4: Global</span>
          <span>P5: Innovation</span>
        </div>
      </motion.div>

      {/* Phase Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6">
        {implementationPhases.map((phase) => (
          <div
            key={phase.id}
            className={`rounded-xl p-6 border ${getStatusColor(phase.status)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(phase.status)}
                <div>
                  <h3 className="text-xl font-bold text-white">{phase.id}: {phase.name}</h3>
                  <p className="text-sm text-slate-400">Weeks {phase.weeks}</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                phase.status === 'completed' ? 'text-emerald-400' :
                phase.status === 'in-progress' ? 'text-amber-400' :
                'text-slate-400'
              }`}>
                {phase.completion}%
              </div>
            </div>

            <Progress 
              value={phase.completion} 
              className={`h-2 mb-4 ${
                phase.status === 'completed' ? 'bg-emerald-900/50' :
                phase.status === 'in-progress' ? 'bg-amber-900/50' :
                'bg-slate-700'
              }`}
            />

            <div className="flex justify-between text-sm mb-4">
              <span className="text-slate-400">Scenarios: {phase.scenariosComplete}/{phase.scenariosTotal}</span>
              <span className={`font-medium ${
                phase.status === 'completed' ? 'text-emerald-400' :
                phase.status === 'in-progress' ? 'text-amber-400' :
                'text-slate-400'
              }`}>
                {phase.status === 'completed' ? 'COMPLETE' :
                 phase.status === 'in-progress' ? 'IN PROGRESS' :
                 'PLANNED'}
              </span>
            </div>

            <div className="space-y-2">
              {phase.features.slice(0, 5).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {feature.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : feature.status === 'partial' ? (
                    <Clock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                  <span className={`${
                    feature.status === 'done' ? 'text-slate-300' :
                    feature.status === 'partial' ? 'text-amber-200' :
                    'text-slate-500'
                  }`}>
                    {feature.name}
                  </span>
                </div>
              ))}
              {phase.features.length > 5 && (
                <div className="text-xs text-slate-500 mt-2">
                  +{phase.features.length - 5} more features
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Scenario Categories by Phase */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-violet-400" />
          Scenario Categories (A-U)
        </h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/30">
                <th className="text-left text-slate-300 font-medium px-4 py-3">Category</th>
                <th className="text-left text-slate-300 font-medium px-4 py-3">Name</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Range</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Total</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Done</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Partial</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Pending</th>
                <th className="text-center text-slate-300 font-medium px-4 py-3">Phase</th>
                <th className="text-left text-slate-300 font-medium px-4 py-3 w-48">Progress</th>
              </tr>
            </thead>
            <tbody>
              {scenarioCategories.map((cat, index) => {
                const progress = Math.round(((cat.implemented + cat.partial * 0.5) / cat.total) * 100);
                return (
                  <tr 
                    key={index}
                    className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-violet-400 font-medium">{cat.id}</td>
                    <td className="px-4 py-3 text-white">{cat.name}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{cat.range}</td>
                    <td className="px-4 py-3 text-center text-white font-medium">{cat.total}</td>
                    <td className="px-4 py-3 text-center text-emerald-400">{cat.implemented}</td>
                    <td className="px-4 py-3 text-center text-amber-400">{cat.partial}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{cat.pending}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        cat.phase === 'P0' || cat.phase === 'P1' || cat.phase === 'P2'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : cat.phase === 'P3'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {cat.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 flex-1 bg-slate-700" />
                        <span className="text-xs text-slate-400 w-10 text-right">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Gap Analysis */}
      <motion.div variants={itemVariants} className="bg-amber-500/10 rounded-2xl p-8 border border-amber-500/30">
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          Gap Analysis & Next Steps
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg font-medium text-amber-400 mb-3">P3 Priorities (Next 6 Weeks)</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 mt-0.5" />
                Bulk video generation automation
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 mt-0.5" />
                Social cuts (TikTok/Reels/Shorts format)
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 mt-0.5" />
                Voice cloning full integration
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-amber-400 mt-0.5" />
                YouTube/LinkedIn direct publishing
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-blue-400 mb-3">P4 Planning (Weeks 19-24)</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Rocket className="w-4 h-4 text-blue-400 mt-0.5" />
                Multi-language support (140+ languages)
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="w-4 h-4 text-blue-400 mt-0.5" />
                Real-time collaboration features
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="w-4 h-4 text-blue-400 mt-0.5" />
                Version control & history
              </li>
              <li className="flex items-start gap-2">
                <Rocket className="w-4 h-4 text-blue-400 mt-0.5" />
                HIPAA full certification
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-violet-400 mb-3">P5 Vision (Weeks 25+)</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 mt-0.5" />
                SSO/SAML enterprise integration
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 mt-0.5" />
                White-label deployment options
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 mt-0.5" />
                Custom AI model training
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 mt-0.5" />
                Enterprise admin console
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
