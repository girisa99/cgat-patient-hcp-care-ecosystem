/**
 * Stage Gates Tab - Go-Live Readiness Checklist
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle2, Clock, AlertCircle,
  Lock, CreditCard, Server, FileText,
  Users, Globe, Database, Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { stageGateChecklist } from '../data/implementation-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Authentication: <Lock className="w-5 h-5" />,
  Authorization: <Shield className="w-5 h-5" />,
  Subscriptions: <CreditCard className="w-5 h-5" />,
  'Core Features': <Zap className="w-5 h-5" />,
  Infrastructure: <Server className="w-5 h-5" />,
  Legal: <FileText className="w-5 h-5" />,
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-amber-400" />;
    case 'pending':
      return <AlertCircle className="w-5 h-5 text-slate-400" />;
    default:
      return <AlertCircle className="w-5 h-5 text-red-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Medium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export const StageGatesTab: React.FC = () => {
  // Group by category
  const groupedItems = stageGateChecklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof stageGateChecklist>);

  // Calculate overall stats
  const totalItems = stageGateChecklist.length;
  const doneItems = stageGateChecklist.filter(i => i.status === 'done').length;
  const inProgressItems = stageGateChecklist.filter(i => i.status === 'in-progress').length;
  const pendingItems = stageGateChecklist.filter(i => i.status === 'pending').length;
  const criticalPending = stageGateChecklist.filter(i => i.priority === 'Critical' && i.status !== 'done').length;
  const overallProgress = Math.round((doneItems / totalItems) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Overview */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl p-8 border border-violet-500/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Stage Gate Checklist</h2>
            <p className="text-slate-300 mt-1">Pre-Launch Readiness Assessment</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">{doneItems}</div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">{inProgressItems}</div>
              <div className="text-sm text-slate-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-400">{pendingItems}</div>
              <div className="text-sm text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${criticalPending > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {criticalPending}
              </div>
              <div className="text-sm text-slate-400">Critical Blockers</div>
            </div>
          </div>
        </div>
        <Progress value={overallProgress} className="h-4 bg-slate-700" />
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-slate-400">Overall Readiness</span>
          <span className="text-white font-medium">{overallProgress}%</span>
        </div>
      </motion.div>

      {/* Category Sections */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
        {Object.entries(groupedItems).map(([category, items]) => {
          const categoryDone = items.filter(i => i.status === 'done').length;
          const categoryProgress = Math.round((categoryDone / items.length) * 100);

          return (
            <div 
              key={category}
              className={`rounded-xl p-6 border ${
                categoryProgress === 100 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    categoryProgress === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-300'
                  }`}>
                    {categoryIcons[category] || <Shield className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                    <span className="text-sm text-slate-400">{categoryDone}/{items.length} complete</span>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${categoryProgress === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {categoryProgress}%
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status === 'done' ? 'bg-emerald-500/10' : 'bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <span className="text-white">{item.item}</span>
                        {item.notes && (
                          <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Critical Blockers Alert */}
      {criticalPending > 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-red-500/10 rounded-xl p-6 border border-red-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-red-400">Critical Blockers for Go-Live</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stageGateChecklist
              .filter(i => i.priority === 'Critical' && i.status !== 'done')
              .map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="text-white">{item.item}</span>
                    <span className="text-xs text-slate-400 ml-2">({item.category})</span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Go-Live Recommendation */}
      <motion.div 
        variants={itemVariants}
        className={`rounded-xl p-8 border text-center ${
          overallProgress >= 90 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : overallProgress >= 70
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <h3 className={`text-2xl font-bold ${
          overallProgress >= 90 ? 'text-emerald-400' : overallProgress >= 70 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {overallProgress >= 90 
            ? '✓ Ready for Production Launch' 
            : overallProgress >= 70
            ? '⚠ Soft Launch Possible with Caveats'
            : '✗ Not Ready for Launch'}
        </h3>
        <p className="text-slate-300 mt-2 max-w-2xl mx-auto">
          {overallProgress >= 90 
            ? 'All critical requirements are met. The platform is ready for production deployment with full feature availability.'
            : overallProgress >= 70
            ? 'Core functionality is ready but some critical items remain. Consider a limited beta launch while completing remaining items.'
            : `${criticalPending} critical blockers must be resolved before any public launch. Focus on authentication, authorization, and subscription systems.`}
        </p>
      </motion.div>
    </motion.div>
  );
};
