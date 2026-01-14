/**
 * Technical Docs Tab - PRD, BRD, FRS Documentation
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Book, Layers, Target,
  CheckCircle2, Clock, AlertCircle,
  Users, Building2, Database, Shield
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

// PRD Requirements by Priority
const prdRequirements = {
  P0: [
    { id: 'PRD-001', name: 'User Authentication & Authorization', status: 'done', segment: 'All' },
    { id: 'PRD-002', name: 'Script Generation Engine', status: 'done', segment: 'All' },
    { id: 'PRD-003', name: 'Recording Studio Core', status: 'done', segment: 'All' },
    { id: 'PRD-004', name: 'Multi-Provider Text-to-Speech', status: 'done', segment: 'All' },
    { id: 'PRD-005', name: 'Subscription & Billing', status: 'done', segment: 'All' },
    { id: 'PRD-006', name: 'Export Pipeline', status: 'done', segment: 'All' },
  ],
  P1: [
    { id: 'PRD-010', name: 'Mobile Responsive Design', status: 'done', segment: 'All' },
    { id: 'PRD-011', name: 'Voice Synthesis Selection', status: 'done', segment: 'Creators' },
    { id: 'PRD-012', name: 'Project Management', status: 'done', segment: 'All' },
    { id: 'PRD-013', name: 'Calendar Integration', status: 'done', segment: 'Enterprise' },
    { id: 'PRD-014', name: 'Credit System', status: 'done', segment: 'All' },
  ],
  P2: [
    { id: 'PRD-020', name: 'AI Agent System', status: 'done', segment: 'All' },
    { id: 'PRD-021', name: 'Ask Genie Assistant', status: 'done', segment: 'All' },
    { id: 'PRD-022', name: 'Production Hub Kanban', status: 'done', segment: 'Enterprise' },
    { id: 'PRD-023', name: 'Guided Wizards', status: 'done', segment: 'All' },
    { id: 'PRD-024', name: 'PWA Installation', status: 'done', segment: 'All' },
  ],
  P3: [
    { id: 'PRD-030', name: 'Bulk Video Generation', status: 'pending', segment: 'Enterprise' },
    { id: 'PRD-031', name: 'Social Cuts Automation', status: 'pending', segment: 'Creators' },
    { id: 'PRD-032', name: 'Voice Cloning', status: 'pending', segment: 'All' },
    { id: 'PRD-033', name: 'Viral Score Predictor', status: 'pending', segment: 'Creators' },
    { id: 'PRD-034', name: 'Direct Platform Publishing', status: 'pending', segment: 'All' },
  ],
  P4: [
    { id: 'PRD-040', name: 'Multi-Language Support', status: 'pending', segment: 'All' },
    { id: 'PRD-041', name: 'Real-time Collaboration', status: 'pending', segment: 'Enterprise' },
    { id: 'PRD-042', name: 'Version Control', status: 'pending', segment: 'All' },
    { id: 'PRD-043', name: 'HIPAA Compliance', status: 'pending', segment: 'Healthcare' },
  ],
  P5: [
    { id: 'PRD-050', name: 'SSO/SAML Integration', status: 'pending', segment: 'Enterprise' },
    { id: 'PRD-051', name: 'White-Label Options', status: 'pending', segment: 'Enterprise' },
    { id: 'PRD-052', name: 'Custom AI Training', status: 'pending', segment: 'Enterprise' },
  ],
};

// Segment Feature Matrix
const segmentFeatureMatrix = [
  { feature: 'Script Generation', creators: true, enterprise: true, healthcare: true, education: true, agencies: true },
  { feature: 'Video Recording', creators: true, enterprise: true, healthcare: true, education: true, agencies: true },
  { feature: 'Text-to-Speech', creators: true, enterprise: true, healthcare: true, education: true, agencies: true },
  { feature: 'AI Agents', creators: true, enterprise: true, healthcare: true, education: true, agencies: true },
  { feature: 'Production Hub', creators: false, enterprise: true, healthcare: true, education: false, agencies: true },
  { feature: 'Bulk Generation', creators: false, enterprise: true, healthcare: false, education: false, agencies: true },
  { feature: 'HIPAA Compliance', creators: false, enterprise: false, healthcare: true, education: false, agencies: false },
  { feature: 'Multi-Language', creators: true, enterprise: true, healthcare: true, education: true, agencies: true },
  { feature: 'White-Label', creators: false, enterprise: true, healthcare: true, education: false, agencies: true },
  { feature: 'SSO/SAML', creators: false, enterprise: true, healthcare: true, education: false, agencies: false },
];

export const TechnicalDocsTab: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState('prd');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-6 px-6"
    >
      {/* Document Selector */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeDoc} onValueChange={setActiveDoc}>
          <TabsList className="bg-slate-800/50 p-1">
            <TabsTrigger value="prd" className="data-[state=active]:bg-violet-600">
              <FileText className="w-4 h-4 mr-2" />
              Product Requirements Document (PRD)
            </TabsTrigger>
            <TabsTrigger value="brd" className="data-[state=active]:bg-violet-600">
              <Book className="w-4 h-4 mr-2" />
              Business Requirements Document (BRD)
            </TabsTrigger>
            <TabsTrigger value="frs" className="data-[state=active]:bg-violet-600">
              <Layers className="w-4 h-4 mr-2" />
              Functional Requirements Specification (FRS)
            </TabsTrigger>
            <TabsTrigger value="segments" className="data-[state=active]:bg-violet-600">
              <Users className="w-4 h-4 mr-2" />
              Segment Feature Matrix
            </TabsTrigger>
          </TabsList>

          {/* PRD Content */}
          <TabsContent value="prd" className="mt-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Product Requirements Document - P0 to P5
              </h3>
              <div className="space-y-6">
                {Object.entries(prdRequirements).map(([priority, reqs]) => (
                  <div key={priority}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={`${
                        priority === 'P0' || priority === 'P1' || priority === 'P2'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {priority}
                      </Badge>
                      <span className="text-slate-300">
                        {reqs.filter(r => r.status === 'done').length}/{reqs.length} Complete
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {reqs.map((req, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            req.status === 'done' 
                              ? 'bg-emerald-500/10 border-emerald-500/20' 
                              : 'bg-slate-700/30 border-slate-600/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {req.status === 'done' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-slate-400" />
                            )}
                            <div>
                              <span className="text-white font-medium">{req.name}</span>
                              <span className="text-xs text-slate-400 ml-2">({req.id})</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {req.segment}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* BRD Content */}
          <TabsContent value="brd" className="mt-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Business Requirements Document
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-violet-400">Business Objectives</h4>
                  <ul className="space-y-2">
                    {[
                      'Capture 2% of AI video market by 2027',
                      'Achieve $8.5M Annual Recurring Revenue by end of Year 2',
                      'Maintain Lifetime Value to Customer Acquisition Cost ratio above 3x',
                      'Reduce content production time by 75% vs manual workflow',
                      'Support 6 initial segments with segment-specific features',
                    ].map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <Target className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-emerald-400">Success Metrics</h4>
                  <ul className="space-y-2">
                    {[
                      'Monthly Active Users: 50,000 by Month 18',
                      'Conversion Rate: 5% free to paid',
                      'Churn Rate: Below 5% monthly',
                      'Net Promoter Score: Above 40',
                      'Support Response Time: Under 4 hours',
                    ].map((metric, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* FRS Content */}
          <TabsContent value="frs" className="mt-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Functional Requirements Specification
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  {
                    title: 'Authentication & Authorization',
                    icon: Shield,
                    reqs: [
                      'Email/password authentication',
                      'OAuth integration (Google)',
                      'Role-based access control',
                      'Session management',
                      'Row Level Security on all tables',
                    ],
                    status: 'complete',
                  },
                  {
                    title: 'Content Production',
                    icon: Layers,
                    reqs: [
                      'Script CRUD operations',
                      'Video recording with WebRTC',
                      'Multi-format export',
                      'Teleprompter sync',
                      'Audio mixing & mastering',
                    ],
                    status: 'complete',
                  },
                  {
                    title: 'AI Integration',
                    icon: Database,
                    reqs: [
                      'Multi-provider TTS routing',
                      'LLM script generation',
                      'Scene analysis AI',
                      'Agent orchestration',
                      'RAG knowledge base',
                    ],
                    status: 'complete',
                  },
                ].map((section, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <section.icon className="w-6 h-6 text-violet-400" />
                      <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {section.reqs.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                    <Badge className="mt-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {section.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Segment Feature Matrix */}
          <TabsContent value="segments" className="mt-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 overflow-hidden">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Segment Feature Matrix
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700/30">
                    <th className="text-left text-slate-300 font-medium px-4 py-3">Feature</th>
                    <th className="text-center text-slate-300 font-medium px-4 py-3">Creators</th>
                    <th className="text-center text-slate-300 font-medium px-4 py-3">Enterprise</th>
                    <th className="text-center text-slate-300 font-medium px-4 py-3">Healthcare</th>
                    <th className="text-center text-slate-300 font-medium px-4 py-3">Education</th>
                    <th className="text-center text-slate-300 font-medium px-4 py-3">Agencies</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentFeatureMatrix.map((row, index) => (
                    <tr 
                      key={index}
                      className="border-t border-slate-700/30 hover:bg-slate-700/20"
                    >
                      <td className="px-4 py-3 text-white font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-center">
                        {row.creators ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.enterprise ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.healthcare ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.education ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.agencies ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
