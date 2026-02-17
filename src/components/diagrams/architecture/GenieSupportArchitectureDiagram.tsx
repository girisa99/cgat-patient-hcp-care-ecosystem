/**
 * Genie Support Architecture Diagram
 * Customer Support & Help System
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  HeadphonesIcon, MessageCircle, FileText, Bot, Users, Clock,
  Download, Maximize2, CheckCircle, AlertTriangle, BookOpen, Zap
} from 'lucide-react';

const supportChannels = [
  { name: 'AI Chat Support', description: 'Ask Genie integration for instant help', status: 'active', icon: Bot },
  { name: 'Ticket System', description: 'Formal support requests with SLA tracking', status: 'active', icon: FileText },
  { name: 'Knowledge Base', description: 'Self-service documentation and guides', status: 'active', icon: BookOpen },
  { name: 'Live Chat', description: 'Real-time human support for enterprise', status: 'beta', icon: MessageCircle },
  { name: 'Community Forum', description: 'User discussions and solutions', status: 'planned', icon: Users },
  { name: 'Video Tutorials', description: 'Step-by-step feature walkthroughs', status: 'active', icon: Zap },
];

const slaMetrics = [
  { tier: 'Enterprise', firstResponse: '< 1 hour', resolution: '< 4 hours', uptime: '99.99%' },
  { tier: 'Business', firstResponse: '< 4 hours', resolution: '< 24 hours', uptime: '99.9%' },
  { tier: 'Pro', firstResponse: '< 24 hours', resolution: '< 72 hours', uptime: '99.5%' },
  { tier: 'Free', firstResponse: 'Best effort', resolution: 'Best effort', uptime: '99%' },
];

const ticketCategories = [
  { category: 'Technical Issues', priority: 'high', examples: ['API errors', 'Generation failures'] },
  { category: 'Billing', priority: 'medium', examples: ['Payment issues', 'Refunds'] },
  { category: 'Feature Requests', priority: 'low', examples: ['New capabilities', 'Integrations'] },
  { category: 'Account', priority: 'medium', examples: ['Access issues', 'Team management'] },
];

export const GenieSupportArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
            <HeadphonesIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Genie Support
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Help Center</Badge>
            </h2>
            <p className="text-slate-400">Multi-Channel Customer Support System</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">6</div>
            <div className="text-sm text-slate-400">Support Channels</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">4</div>
            <div className="text-sm text-slate-400">SLA Tiers</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-teal-400">24/7</div>
            <div className="text-sm text-slate-400">AI Availability</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">75%</div>
            <div className="text-sm text-slate-400">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Support Channels */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            Support Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportChannels.map((channel, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <channel.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{channel.name}</span>
                    <Badge className={
                      channel.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      channel.status === 'beta' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {channel.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">{channel.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLA Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            SLA by Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {slaMetrics.map((sla, i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="font-semibold text-white mb-3">{sla.tier}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">First Response:</span>
                      <span className="text-emerald-400">{sla.firstResponse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolution:</span>
                      <span className="text-green-400">{sla.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="text-teal-400">{sla.uptime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Categories */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-emerald-400" />
            Ticket Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ticketCategories.map((cat, i) => (
              <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{cat.category}</span>
                  <Badge className={
                    cat.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    cat.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {cat.priority}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cat.examples.map((ex, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{ex}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Implementation Progress</span>
            <span className="text-emerald-400">75%</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="mt-2 text-sm text-slate-400">Phase: P2-P3 (Multi-Channel Support)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieSupportArchitectureDiagram;
