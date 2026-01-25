/**
 * Genie Cast Architecture Diagram
 * 7th Core Product - "Make It. Show It. Scale It."
 * Automated Marketing & Distribution Engine
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Radio, Globe, Calendar, Target, Zap, Users, BarChart3, Share2,
  Play, Clock, CheckCircle, TrendingUp, Award, Layers, Send, RefreshCw,
  Download, Maximize2, ChevronRight
} from 'lucide-react';

const distributionPlatforms = [
  { name: 'LinkedIn', icon: '💼', status: 'active', reach: '850M+', contentTypes: ['Articles', 'Videos', 'Carousels'] },
  { name: 'YouTube', icon: '▶️', status: 'active', reach: '2.5B+', contentTypes: ['Shorts', 'Long-form', 'Tutorials'] },
  { name: 'TikTok', icon: '🎵', status: 'active', reach: '1.5B+', contentTypes: ['Vertical Shorts', 'Trends'] },
  { name: 'Instagram', icon: '📸', status: 'active', reach: '2B+', contentTypes: ['Reels', 'Stories', 'Posts'] },
  { name: 'Twitter/X', icon: '𝕏', status: 'active', reach: '550M+', contentTypes: ['Threads', 'Video Clips'] },
  { name: 'Blog/SEO', icon: '📝', status: 'active', reach: 'Organic', contentTypes: ['Articles', 'Case Studies'] },
];

const regionalBundles = [
  { region: 'North America', code: 'NA', timezone: 'UTC-5 to -8', languages: ['en-US'], status: 'active' },
  { region: 'Europe West', code: 'EU-W', timezone: 'UTC+0 to +2', languages: ['en-GB', 'de', 'fr', 'es'], status: 'active' },
  { region: 'Europe East', code: 'EU-E', timezone: 'UTC+2 to +3', languages: ['pl', 'ru', 'tr'], status: 'active' },
  { region: 'MENA', code: 'MENA', timezone: 'UTC+2 to +4', languages: ['ar', 'he'], status: 'active' },
  { region: 'India/South Asia', code: 'SA', timezone: 'UTC+5:30', languages: ['hi', 'ta', 'te'], status: 'active' },
  { region: 'China', code: 'CN', timezone: 'UTC+8', languages: ['zh-CN', 'zh-TW'], status: 'active' },
  { region: 'Japan', code: 'JP', timezone: 'UTC+9', languages: ['ja'], status: 'active' },
  { region: 'Korea', code: 'KR', timezone: 'UTC+9', languages: ['ko'], status: 'active' },
  { region: 'SEA', code: 'SEA', timezone: 'UTC+7 to +8', languages: ['th', 'vi', 'id'], status: 'active' },
  { region: 'ANZ', code: 'ANZ', timezone: 'UTC+10 to +12', languages: ['en-AU', 'en-NZ'], status: 'active' },
  { region: 'LatAm', code: 'LATAM', timezone: 'UTC-3 to -5', languages: ['es-MX', 'pt-BR'], status: 'active' },
  { region: 'Africa', code: 'AF', timezone: 'UTC+1 to +3', languages: ['en', 'fr', 'sw'], status: 'active' },
  { region: 'Russia/CIS', code: 'CIS', timezone: 'UTC+3 to +12', languages: ['ru', 'uk'], status: 'active' },
  { region: 'Global/English', code: 'GLOBAL', timezone: 'All', languages: ['en'], status: 'active' },
];

const contentRotationPipelines = [
  { category: 'Video', count: 24, examples: ['Text-to-Video', 'Avatar-to-Video', 'Screen-to-Video'] },
  { category: 'Audio', count: 18, examples: ['TTS', 'Voice Clone', 'Podcast'] },
  { category: 'Visual', count: 22, examples: ['Image Gen', '3D Assets', 'Infographics'] },
  { category: 'Document', count: 15, examples: ['PPT', 'PDF', 'One-Pagers'] },
  { category: 'Social', count: 20, examples: ['Carousels', 'Stories', 'Threads'] },
  { category: 'Marketing', count: 20, examples: ['Ads', 'Emails', 'Landing Pages'] },
];

const schedulingCycles = [
  { slot: 'Morning', time: '8-10 AM Local', purpose: 'Professional/B2B Content', platforms: ['LinkedIn', 'Twitter'] },
  { slot: 'Afternoon', time: '12-2 PM Local', purpose: 'Engagement/Educational', platforms: ['YouTube', 'Blog'] },
  { slot: 'Evening', time: '6-9 PM Local', purpose: 'Entertainment/Social', platforms: ['TikTok', 'Instagram'] },
];

const gamificationMetrics = [
  { level: 'Novice', xpRequired: 0, badge: '🌱', perks: 'Basic access' },
  { level: 'Creator', xpRequired: 500, badge: '✨', perks: '+10% credits' },
  { level: 'Producer', xpRequired: 2000, badge: '🎬', perks: '+25% credits' },
  { level: 'Director', xpRequired: 5000, badge: '🎯', perks: 'Priority queue' },
  { level: 'Legend', xpRequired: 10000, badge: '👑', perks: 'Full access' },
];

export const GenieCastArchitectureDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportPNG = () => {
    console.log('Exporting Genie Cast Architecture as PNG...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Genie Cast
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">7th Product</Badge>
            </h2>
            <p className="text-slate-400 text-lg italic">"Make It. Show It. Scale It."</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPNG}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">119</div>
            <div className="text-sm text-slate-400">Pipeline Rotation</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">14</div>
            <div className="text-sm text-slate-400">Regional Bundles</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">6</div>
            <div className="text-sm text-slate-400">Distribution Platforms</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">24/7</div>
            <div className="text-sm text-slate-400">Global Coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="pipelines">Pipeline Rotation</TabsTrigger>
          <TabsTrigger value="regions">Regional Bundles</TabsTrigger>
          <TabsTrigger value="gamification">Creator Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-orange-400" />
                Genie Cast Architecture Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Layer */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" /> Content Generation
                  </h4>
                  <div className="space-y-2">
                    {['119 Pipelines', '12 AI Providers', '35+ Output Formats', '50+ Templates'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processing Layer */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" /> Orchestration Engine
                  </h4>
                  <div className="space-y-2">
                    {['Content Scheduler', 'Regional Router', 'Platform Adapter', 'Quality Gate'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <RefreshCw className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output Layer */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" /> Global Distribution
                  </h4>
                  <div className="space-y-2">
                    {['6 Platforms', '14 Regions', '42 Daily Posts', 'Analytics Dashboard'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <Send className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flow Diagram */}
              <div className="mt-8 p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <Zap className="h-5 w-5 text-violet-400" />
                    </div>
                    <span className="text-sm text-slate-300">Genie Products</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Radio className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-sm text-slate-300">Genie Cast</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-300">14 Regions</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Share2 className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-sm text-slate-300">6 Platforms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-orange-400" />
                Multi-Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {distributionPlatforms.map((platform, i) => (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{platform.icon}</span>
                          <span className="font-semibold text-white">{platform.name}</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      </div>
                      <div className="text-sm text-slate-400 mb-2">Reach: {platform.reach}</div>
                      <div className="flex flex-wrap gap-1">
                        {platform.contentTypes.map((type, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-400" />
                Timezone-Aware Scheduling (3x Daily per Region)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schedulingCycles.map((cycle, i) => (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <span className="font-semibold text-white">{cycle.slot}</span>
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{cycle.time}</div>
                      <div className="text-sm text-slate-300 mb-3">{cycle.purpose}</div>
                      <div className="flex gap-1">
                        {cycle.platforms.map((p, j) => (
                          <Badge key={j} className="bg-orange-500/20 text-orange-400">{p}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">42 Posts/Day</div>
                  <div className="text-sm text-slate-400">14 Regions × 3 Time Slots = Global 24/7 Presence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-400" />
                119-Pipeline Content Rotation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentRotationPipelines.map((category, i) => (
                    <Card key={i} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-white">{category.category}</span>
                          <Badge className="bg-violet-500/20 text-violet-400">{category.count} Pipelines</Badge>
                        </div>
                        <div className="space-y-1">
                          {category.examples.map((ex, j) => (
                            <div key={j} className="text-sm text-slate-400 flex items-center gap-2">
                              <Play className="h-3 w-3" />
                              {ex}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="text-sm text-amber-400">
                  <strong>Anti-Repetition Logic:</strong> Each pipeline showcased max 1x per week per region to ensure fresh content variety
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-400" />
                14 Regional Content Bundles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {regionalBundles.map((bundle, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500/20 text-blue-400">{bundle.code}</Badge>
                        <div>
                          <div className="font-medium text-white">{bundle.region}</div>
                          <div className="text-xs text-slate-400">{bundle.timezone}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {bundle.languages.slice(0, 2).map((lang, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{lang}</Badge>
                        ))}
                        {bundle.languages.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{bundle.languages.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-400" />
                Internal Creator Rewards System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {gamificationMetrics.map((level, i) => (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{level.badge}</div>
                      <div className="font-semibold text-white">{level.level}</div>
                      <div className="text-xs text-slate-400 mb-2">{level.xpRequired} XP</div>
                      <Badge variant="outline" className="text-xs">{level.perks}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-white">Leaderboards</span>
                    </div>
                    <div className="text-sm text-slate-400">Weekly/Monthly rankings by impressions & engagement</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-amber-400" />
                      <span className="font-semibold text-white">Badges</span>
                    </div>
                    <div className="text-sm text-slate-400">First Viral, AI Pioneer, Regional Champion, etc.</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-violet-400" />
                      <span className="font-semibold text-white">Credit Rewards</span>
                    </div>
                    <div className="text-sm text-slate-400">Top contributors earn bonus AI credits</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Overall Progress</span>
                <span className="text-orange-400">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="text-green-400 font-semibold">✅ Complete</div>
                <div className="text-slate-400">Content Scheduler, Regional Router</div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <div className="text-amber-400 font-semibold">🔄 In Progress</div>
                <div className="text-slate-400">Platform Adapters, Analytics</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="text-blue-400 font-semibold">📋 Planned</div>
                <div className="text-slate-400">Public API, Subscriber Tools</div>
              </div>
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <div className="text-violet-400 font-semibold">🎯 Phase</div>
                <div className="text-slate-400">P2-P3 (Enterprise Ready)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieCastArchitectureDiagram;
