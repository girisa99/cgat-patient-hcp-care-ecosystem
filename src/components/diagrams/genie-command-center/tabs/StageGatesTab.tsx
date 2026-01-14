/**
 * Stage Gates Tab - Go-Live Readiness Checklist
 * Clean enterprise styling with proper design tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle2, Clock, AlertCircle,
  Lock, CreditCard, Server, FileText, Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'pending':
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    default:
      return <AlertCircle className="w-5 h-5 text-destructive" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-500/10 text-red-600 border-red-500/30';
    case 'High':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    case 'Medium':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
      className="max-w-[1920px] mx-auto space-y-8 p-6"
    >
      {/* Overview */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Stage Gate Checklist</h2>
                <p className="text-muted-foreground mt-1">Pre-Launch Readiness Assessment</p>
              </div>
              <div className="flex items-center gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{doneItems}</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">{inProgressItems}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground">{pendingItems}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${criticalPending > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {criticalPending}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical Blockers</div>
                </div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted-foreground">Overall Readiness</span>
              <span className="text-foreground font-medium">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Sections */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedItems).map(([category, items]) => {
          const categoryDone = items.filter(i => i.status === 'done').length;
          const categoryProgress = Math.round((categoryDone / items.length) * 100);

          return (
            <Card 
              key={category}
              className={categoryProgress === 100 ? 'border-green-500/30 bg-green-500/5' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      categoryProgress === 100 ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {categoryIcons[category] || <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{category}</CardTitle>
                      <span className="text-sm text-muted-foreground">{categoryDone}/{items.length} complete</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${categoryProgress === 100 ? 'text-green-600' : 'text-amber-500'}`}>
                    {categoryProgress}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status === 'done' ? 'bg-green-500/5' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <span className="text-foreground text-sm">{item.item}</span>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Critical Blockers Alert */}
      {criticalPending > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <CardTitle className="text-destructive">Critical Blockers for Go-Live</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stageGateChecklist
                  .filter(i => i.priority === 'Critical' && i.status !== 'done')
                  .map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <div>
                        <span className="text-foreground text-sm">{item.item}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Go-Live Recommendation */}
      <motion.div variants={itemVariants}>
        <Card className={`text-center ${
          overallProgress >= 90 
            ? 'border-green-500/30 bg-green-500/5' 
            : overallProgress >= 70
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-destructive/30 bg-destructive/5'
        }`}>
          <CardContent className="p-8">
            <h3 className={`text-2xl font-bold ${
              overallProgress >= 90 ? 'text-green-600' : overallProgress >= 70 ? 'text-amber-500' : 'text-destructive'
            }`}>
              {overallProgress >= 90 
                ? '✓ Ready for Production Launch' 
                : overallProgress >= 70
                ? '⚠ Soft Launch Possible with Caveats'
                : '✗ Not Ready for Launch'}
            </h3>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {overallProgress >= 90 
                ? 'All critical requirements are met. The platform is ready for production deployment with full feature availability.'
                : overallProgress >= 70
                ? 'Core functionality is ready but some critical items remain. Consider a limited beta launch while completing remaining items.'
                : `${criticalPending} critical blockers must be resolved before any public launch. Focus on authentication, authorization, and subscription systems.`}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
