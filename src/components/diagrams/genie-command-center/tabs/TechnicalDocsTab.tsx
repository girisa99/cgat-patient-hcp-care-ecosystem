/**
 * Technical Docs Tab - PRD, BRD, FRS Documentation
 * Clean enterprise styling with proper design tokens
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Book, Layers, Target,
  CheckCircle2, Clock, Shield, Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
      className="max-w-[1920px] mx-auto space-y-6 p-6"
    >
      {/* Document Selector */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeDoc} onValueChange={setActiveDoc}>
          <ScrollArea className="w-full whitespace-nowrap pb-3">
            <TabsList className="inline-flex h-auto gap-1 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="prd" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-4 h-4" />
                <span className="whitespace-nowrap">PRD</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brd" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Book className="w-4 h-4" />
                <span className="whitespace-nowrap">BRD</span>
              </TabsTrigger>
              <TabsTrigger 
                value="frs" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Layers className="w-4 h-4" />
                <span className="whitespace-nowrap">FRS</span>
              </TabsTrigger>
              <TabsTrigger 
                value="segments" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-4 h-4" />
                <span className="whitespace-nowrap">Segment Matrix</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* PRD Content */}
          <TabsContent value="prd" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Product Requirements Document - P0 to P5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(prdRequirements).map(([priority, reqs]) => (
                  <div key={priority}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant={
                        priority === 'P0' || priority === 'P1' || priority === 'P2'
                          ? 'default' : 'secondary'
                      } className={
                        priority === 'P0' || priority === 'P1' || priority === 'P2'
                          ? 'bg-green-500/10 text-green-600 border-green-500/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      }>
                        {priority}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {reqs.filter(r => r.status === 'done').length}/{reqs.length} Complete
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reqs.map((req, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            req.status === 'done' 
                              ? 'bg-green-500/5 border-green-500/20' 
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {req.status === 'done' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <span className="text-foreground font-medium text-sm">{req.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">({req.id})</span>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRD Content */}
          <TabsContent value="brd" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Business Requirements Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-primary">Business Objectives</h4>
                    <ul className="space-y-2">
                      {[
                        'Capture 2% of AI video market by 2027',
                        'Achieve $8.5M Annual Recurring Revenue by end of Year 2',
                        'Maintain Lifetime Value to Customer Acquisition Cost ratio above 3x',
                        'Reduce content production time by 75% vs manual workflow',
                        'Support 6 initial segments with segment-specific features',
                      ].map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                          <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-green-600">Success Metrics</h4>
                    <ul className="space-y-2">
                      {[
                        'Monthly Active Users: 50,000 by Month 18',
                        'Conversion Rate: 5% free to paid',
                        'Churn Rate: Below 5% monthly',
                        'Net Promoter Score: Above 40',
                        'Support Response Time: Under 4 hours',
                      ].map((metric, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FRS Content */}
          <TabsContent value="frs" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Functional Requirements Specification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      icon: Target,
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
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <section.icon className="w-5 h-5 text-primary" />
                          <CardTitle className="text-base">{section.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-4">
                          {section.reqs.map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                          {section.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segment Feature Matrix */}
          <TabsContent value="segments" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Segment Feature Matrix</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left text-muted-foreground font-medium px-4 py-3 rounded-tl-lg">Feature</th>
                      <th className="text-center text-muted-foreground font-medium px-4 py-3">Creators</th>
                      <th className="text-center text-muted-foreground font-medium px-4 py-3">Enterprise</th>
                      <th className="text-center text-muted-foreground font-medium px-4 py-3">Healthcare</th>
                      <th className="text-center text-muted-foreground font-medium px-4 py-3">Education</th>
                      <th className="text-center text-muted-foreground font-medium px-4 py-3 rounded-tr-lg">Agencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentFeatureMatrix.map((row, index) => (
                      <tr 
                        key={index}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground font-medium">{row.feature}</td>
                        <td className="px-4 py-3 text-center">
                          {row.creators ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.enterprise ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.healthcare ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.education ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.agencies ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
