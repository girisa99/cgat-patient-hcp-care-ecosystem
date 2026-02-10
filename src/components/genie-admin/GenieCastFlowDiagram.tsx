/**
 * Genie Cast Flow Tabs
 * Tab-based representation of the video production pipeline
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  MessageSquare, 
  Settings2, 
  Zap, 
  Grid3X3, 
  Film,
  Globe,
  Volume2,
  Video,
  Upload,
  CheckCircle
} from 'lucide-react';

export const GenieCastFlowDiagram: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Production Pipeline Stages</h2>
      </div>
      
      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="capture" className="flex flex-col gap-1 py-2">
            <Camera className="w-4 h-4" />
            <span className="text-xs">1. Capture</span>
          </TabsTrigger>
          <TabsTrigger value="orchestration" className="flex flex-col gap-1 py-2">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs">2. Orchestrate</span>
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex flex-col gap-1 py-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs">3. Generate</span>
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex flex-col gap-1 py-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs">4. Route</span>
          </TabsTrigger>
          <TabsTrigger value="assembly" className="flex flex-col gap-1 py-2">
            <Video className="w-4 h-4" />
            <span className="text-xs">5. Assemble</span>
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex flex-col gap-1 py-2">
            <Upload className="w-4 h-4" />
            <span className="text-xs">6. Publish</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Screenshots
                </CardTitle>
                <CardDescription>Capture product UI for video visuals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Manual upload</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Auto-capture (html2canvas)</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Change detection alerts</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  AI Messaging
                </CardTitle>
                <CardDescription>Generate hooks, CTAs, and scripts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Feature discovery</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Bi-weekly feedback analysis</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Admin approval workflow</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orchestration" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-purple-500" />
                Genie Cast Service
              </CardTitle>
              <CardDescription>Validates assets and coordinates generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Check screenshot readiness</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Verify approved messaging</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Build localized scripts</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4 text-green-500" />
                  Quick Generate
                </CardTitle>
                <CardDescription>All products, selected languages</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Fast turnaround</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Grid3X3 className="w-4 h-4 text-indigo-500" />
                  Matrix Generate
                </CardTitle>
                <CardDescription>14 langs × 8 products × 4 tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Bulk production</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Film className="w-4 h-4 text-pink-500" />
                  Feature Video
                </CardTitle>
                <CardDescription>Single feature focus</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Targeted content</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Claude Zone
                </CardTitle>
                <CardDescription>EN, ES, FR, PT</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-blue-500/20 text-blue-700">ElevenLabs TTS</Badge>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4 text-orange-500" />
                  Alibaba Zone
                </CardTitle>
                <CardDescription>ZH, JA, KO</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-orange-500/20 text-orange-700">Qwen3-TTS</Badge>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  Gemini Zone
                </CardTitle>
                <CardDescription>HI, AR, BN, ID</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-emerald-500/20 text-emerald-700">Azure Neural TTS</Badge>
              </CardContent>
            </Card>
            <Card className="border-gray-500/30 bg-gray-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4 text-gray-500" />
                  Global Fallback
                </CardTitle>
                <CardDescription>Other languages</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-gray-500/20 text-gray-700">GPT-4o</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assembly" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="w-4 h-4 text-cyan-500" />
                  TTS Generation
                </CardTitle>
                <CardDescription>Native voiceover per language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Localized scripts</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Regional accents</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Approved messaging</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="w-4 h-4 text-red-500" />
                  Video Assembly
                </CardTitle>
                <CardDescription>genie-cast-assembler Edge Function</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Screenshots + Audio</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Optional: AI Avatar</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Optional: 3D Product</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="publish" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="w-4 h-4 text-teal-500" />
                Output Destinations
              </CardTitle>
              <CardDescription>Automatic sync to all channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Landing Page Hero</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Content Library</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Video Analytics</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-3 h-3 text-green-500" /> Feedback Loop (bi-weekly)</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenieCastFlowDiagram;
