/**
 * Ask Genie Architecture Diagram
 * AI Assistant & Conversational Interface
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  MessageCircle, Brain, Zap, Globe, Shield, Database,
  Download, Maximize2, CheckCircle, Bot, Sparkles, Users
} from 'lucide-react';

const askGenieCapabilities = [
  { name: 'Multi-Model Routing', description: 'Dynamic provider selection based on task', status: 'active', icon: Brain },
  { name: 'Context Awareness', description: 'Product-aware responses across ecosystem', status: 'active', icon: Sparkles },
  { name: 'RAG Integration', description: 'Knowledge base retrieval for accuracy', status: 'active', icon: Database },
  { name: 'Multi-Language', description: '120+ languages via 5-zone routing', status: 'active', icon: Globe },
  { name: 'Tool Calling', description: 'Execute actions across Genie products', status: 'beta', icon: Zap },
  { name: 'Conversation Memory', description: 'Session persistence and context carry-over', status: 'active', icon: MessageCircle },
];

const modelRouting = [
  { region: 'Western/EU', primary: 'Claude 3.5 Sonnet', fallback: 'GPT-4o', latency: '~800ms' },
  { region: 'CJK', primary: 'Qwen-Max', fallback: 'Claude', latency: '~600ms' },
  { region: 'MENA', primary: 'GPT-4o', fallback: 'Claude', latency: '~900ms' },
  { region: 'India/SEA', primary: 'Gemini 2.0', fallback: 'GPT-4o', latency: '~700ms' },
];

const integrationPoints = [
  { product: 'Genie Spark', actions: ['Generate presentation', 'Apply template', 'Export'] },
  { product: 'Genie Mind', actions: ['Analyze content', 'Summarize', 'Extract insights'] },
  { product: 'Genie Vibe', actions: ['Add voiceover', 'Generate video', 'Create avatar'] },
  { product: 'Genie Deck', actions: ['Create slides', 'Apply branding', 'Localize'] },
  { product: 'Genie Hub', actions: ['Review content', 'Assign tasks', 'Track progress'] },
  { product: 'Genie Cast', actions: ['Schedule post', 'Distribute content', 'Analytics'] },
];

export const GenieAskGenieArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Ask Genie
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">AI Assistant</Badge>
            </h2>
            <p className="text-slate-400">Conversational AI Interface for the Entire Ecosystem</p>
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
            <div className="text-3xl font-bold text-indigo-400">12</div>
            <div className="text-sm text-slate-400">AI Models</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">7</div>
            <div className="text-sm text-slate-400">Product Integrations</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-violet-400">120+</div>
            <div className="text-sm text-slate-400">Languages</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">~750ms</div>
            <div className="text-sm text-slate-400">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Core Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {askGenieCapabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <cap.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{cap.name}</span>
                    <Badge className={cap.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {cap.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">{cap.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Routing */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            Regional Model Routing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modelRouting.map((route, i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="font-semibold text-white mb-2">{route.region}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary:</span>
                      <Badge className="bg-indigo-500/20 text-indigo-400">{route.primary}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fallback:</span>
                      <Badge variant="outline">{route.fallback}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latency:</span>
                      <span className="text-green-400">{route.latency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Integrations */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            Cross-Product Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationPoints.map((integration, i) => (
              <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-medium text-white mb-2">{integration.product}</div>
                <div className="flex flex-wrap gap-1">
                  {integration.actions.map((action, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{action}</Badge>
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
            <span className="text-indigo-400">80%</span>
          </div>
          <Progress value={80} className="h-2" />
          <div className="mt-2 text-sm text-slate-400">Phase: P2 (Enterprise Ready)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieAskGenieArchitectureDiagram;
