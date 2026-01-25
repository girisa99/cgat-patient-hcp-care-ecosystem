/**
 * Genie Provider Capability Matrix
 * Complete 12-Provider Network with Capabilities
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Grid3X3, Download, Maximize2, CheckCircle, XCircle, Zap, Globe,
  Brain, Mic, Image, Video, Box, Languages, CreditCard, Server
} from 'lucide-react';

interface ProviderCapability {
  id: string;
  name: string;
  logo: string;
  category: string;
  primaryUse: string;
  capabilities: {
    llm: boolean;
    chat: boolean;
    vision: boolean;
    tts: boolean;
    stt: boolean;
    translation: boolean;
    imageGen: boolean;
    videoGen: boolean;
    avatars: boolean;
    threeD: boolean;
    voiceClone: boolean;
    embeddings: boolean;
  };
  models: string[];
  regions: string[];
  tier: 'premium' | 'standard' | 'specialized';
  costTier: 'high' | 'medium' | 'low';
  status: 'production' | 'beta' | 'planned';
}

const providers: ProviderCapability[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🧠',
    category: 'LLM & Vision',
    primaryUse: 'Flagship LLM, Fallback Zone',
    capabilities: {
      llm: true, chat: true, vision: true, tts: true, stt: true,
      translation: false, imageGen: true, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4-Turbo', 'Whisper', 'DALL-E 3'],
    regions: ['Global', 'Fallback Zone'],
    tier: 'premium',
    costTier: 'high',
    status: 'production'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '🔮',
    category: 'LLM',
    primaryUse: 'Claude Zone (Western/EU)',
    capabilities: {
      llm: true, chat: true, vision: true, tts: false, stt: false,
      translation: false, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: false
    },
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
    regions: ['NA', 'EU-W', 'ANZ', 'LATAM'],
    tier: 'premium',
    costTier: 'high',
    status: 'production'
  },
  {
    id: 'google',
    name: 'Google',
    logo: '🌐',
    category: 'LLM & Vision',
    primaryUse: 'Gemini Zone (India/SEA/Africa)',
    capabilities: {
      llm: true, chat: true, vision: true, tts: true, stt: true,
      translation: true, imageGen: true, videoGen: true, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro', 'Veo 2', 'Imagen 3'],
    regions: ['India', 'SEA', 'Africa', 'Global'],
    tier: 'premium',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🔬',
    category: 'LLM & Code',
    primaryUse: 'Code Generation, Cost Optimization',
    capabilities: {
      llm: true, chat: true, vision: false, tts: false, stt: false,
      translation: false, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['DeepSeek-V3', 'DeepSeek-R1', 'DeepSeek-Coder'],
    regions: ['Global', 'CN'],
    tier: 'standard',
    costTier: 'low',
    status: 'production'
  },
  {
    id: 'alibaba',
    name: 'Alibaba Cloud',
    logo: '🏮',
    category: 'Full Stack CJK',
    primaryUse: 'Alibaba Zone (China/Japan/Korea)',
    capabilities: {
      llm: true, chat: true, vision: true, tts: true, stt: true,
      translation: true, imageGen: true, videoGen: true, avatars: true,
      threeD: false, voiceClone: true, embeddings: true
    },
    models: ['Qwen-Max', 'Qwen-MT', 'CosyVoice', 'Wan2.2', 'OmniAvatar'],
    regions: ['CN', 'JP', 'KR', 'SEA'],
    tier: 'premium',
    costTier: 'low',
    status: 'production'
  },
  {
    id: 'azure',
    name: 'Azure AI',
    logo: '☁️',
    category: 'Speech & Vision',
    primaryUse: 'Arabic/RTL, Neural Voices, Visemes',
    capabilities: {
      llm: true, chat: true, vision: true, tts: true, stt: true,
      translation: true, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['GPT-4o (Azure)', 'Neural TTS', 'Speech SDK', 'Viseme API'],
    regions: ['MENA', 'Africa', 'India', 'EU', 'Global'],
    tier: 'premium',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'modelslab',
    name: 'ModelsLab',
    logo: '🎨',
    category: 'Media Generation',
    primaryUse: 'FLUX Images, AnimateDiff, 3D Mesh',
    capabilities: {
      llm: false, chat: false, vision: false, tts: false, stt: false,
      translation: false, imageGen: true, videoGen: true, avatars: false,
      threeD: true, voiceClone: false, embeddings: false
    },
    models: ['FLUX Pro', 'FLUX Schnell', 'AnimateDiff', 'Text-to-3D'],
    regions: ['Global'],
    tier: 'specialized',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    logo: '🔄',
    category: 'Model Hosting',
    primaryUse: 'Open Source Models, Experimental',
    capabilities: {
      llm: true, chat: false, vision: true, tts: false, stt: false,
      translation: false, imageGen: true, videoGen: true, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['LLaMA', 'Stable Diffusion', 'Various Open Source'],
    regions: ['Global'],
    tier: 'standard',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    logo: '🎙️',
    category: 'Voice & Audio',
    primaryUse: 'Premium TTS, Voice Cloning',
    capabilities: {
      llm: false, chat: false, vision: false, tts: true, stt: false,
      translation: false, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: true, embeddings: false
    },
    models: ['Multilingual v2', 'Turbo v2.5', 'Voice Design', 'Conversational'],
    regions: ['NA', 'EU', 'LATAM', 'Global'],
    tier: 'premium',
    costTier: 'high',
    status: 'production'
  },
  {
    id: 'deepl',
    name: 'DeepL',
    logo: '📚',
    category: 'Translation',
    primaryUse: 'European Languages, Document Translation',
    capabilities: {
      llm: false, chat: false, vision: false, tts: false, stt: false,
      translation: true, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: false
    },
    models: ['DeepL Pro', 'Document Translation'],
    regions: ['EU-W', 'EU-E', 'NA'],
    tier: 'specialized',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    logo: '⚡',
    category: 'Infrastructure',
    primaryUse: 'Database, Auth, Edge Functions, Storage',
    capabilities: {
      llm: false, chat: false, vision: false, tts: false, stt: false,
      translation: false, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: true
    },
    models: ['PostgreSQL', 'pgvector', 'Edge Runtime'],
    regions: ['Global'],
    tier: 'premium',
    costTier: 'medium',
    status: 'production'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💳',
    category: 'Payments',
    primaryUse: 'Subscriptions, Credits, Invoicing',
    capabilities: {
      llm: false, chat: false, vision: false, tts: false, stt: false,
      translation: false, imageGen: false, videoGen: false, avatars: false,
      threeD: false, voiceClone: false, embeddings: false
    },
    models: ['Payments API', 'Billing', 'Connect'],
    regions: ['Global'],
    tier: 'premium',
    costTier: 'medium',
    status: 'production'
  },
];

const zoneRouting = [
  { zone: 'Claude Zone', primary: 'Anthropic', regions: ['NA', 'EU-W', 'ANZ', 'LATAM'], tasks: ['LLM', 'Chat', 'Analysis'] },
  { zone: 'Alibaba Zone', primary: 'Alibaba', regions: ['CN', 'JP', 'KR', 'TW'], tasks: ['LLM', 'TTS', 'Translation', 'Avatars'] },
  { zone: 'Arabic Zone', primary: 'Azure', regions: ['MENA', 'GCC'], tasks: ['TTS', 'STT', 'RTL Support'] },
  { zone: 'Gemini Zone', primary: 'Google', regions: ['India', 'SEA', 'Africa'], tasks: ['LLM', 'Vision', 'Cost-Optimized'] },
  { zone: 'Fallback Zone', primary: 'OpenAI', regions: ['Global'], tasks: ['All Tasks', 'Failover'] },
];

const capabilityIcons: Record<string, React.ReactNode> = {
  llm: <Brain className="h-4 w-4" />,
  chat: <Brain className="h-4 w-4" />,
  vision: <Image className="h-4 w-4" />,
  tts: <Mic className="h-4 w-4" />,
  stt: <Mic className="h-4 w-4" />,
  translation: <Languages className="h-4 w-4" />,
  imageGen: <Image className="h-4 w-4" />,
  videoGen: <Video className="h-4 w-4" />,
  avatars: <Video className="h-4 w-4" />,
  threeD: <Box className="h-4 w-4" />,
  voiceClone: <Mic className="h-4 w-4" />,
  embeddings: <Server className="h-4 w-4" />,
};

export const GenieProviderCapabilityMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState('matrix');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(providers.map(p => p.category))];
  const filteredProviders = selectedCategory 
    ? providers.filter(p => p.category === selectedCategory)
    : providers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <Grid3X3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Provider Capability Matrix</h2>
            <p className="text-slate-400">12-Provider Network with 5-Zone Regional Routing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">12</div>
            <div className="text-xs text-slate-400">Core Providers</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">5</div>
            <div className="text-xs text-slate-400">Routing Zones</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">40+</div>
            <div className="text-xs text-slate-400">AI Models</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">14</div>
            <div className="text-xs text-slate-400">Regions</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">12</div>
            <div className="text-xs text-slate-400">Capability Types</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-xs text-slate-400">Production Ready</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="matrix">Capability Matrix</TabsTrigger>
          <TabsTrigger value="zones">Zone Routing</TabsTrigger>
          <TabsTrigger value="providers">Provider Details</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-emerald-400" />
                  Full Capability Matrix
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Provider</TableHead>
                      <TableHead className="text-slate-300 text-center">LLM</TableHead>
                      <TableHead className="text-slate-300 text-center">Vision</TableHead>
                      <TableHead className="text-slate-300 text-center">TTS</TableHead>
                      <TableHead className="text-slate-300 text-center">STT</TableHead>
                      <TableHead className="text-slate-300 text-center">Translate</TableHead>
                      <TableHead className="text-slate-300 text-center">Image</TableHead>
                      <TableHead className="text-slate-300 text-center">Video</TableHead>
                      <TableHead className="text-slate-300 text-center">Avatar</TableHead>
                      <TableHead className="text-slate-300 text-center">3D</TableHead>
                      <TableHead className="text-slate-300 text-center">Voice Clone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map((provider) => (
                      <TableRow key={provider.id} className="border-slate-700">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{provider.logo}</span>
                            <div>
                              <div className="font-medium text-white">{provider.name}</div>
                              <div className="text-xs text-slate-400">{provider.category}</div>
                            </div>
                          </div>
                        </TableCell>
                        {['llm', 'vision', 'tts', 'stt', 'translation', 'imageGen', 'videoGen', 'avatars', 'threeD', 'voiceClone'].map(cap => (
                          <TableCell key={cap} className="text-center">
                            {provider.capabilities[cap as keyof typeof provider.capabilities] ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-600 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-400" />
                5-Zone Regional Routing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zoneRouting.map((zone, i) => (
                  <Card key={i} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white">{zone.zone}</span>
                        <Badge className="bg-emerald-500/20 text-emerald-400">{zone.primary}</Badge>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs text-slate-400 mb-1">Regions:</div>
                        <div className="flex flex-wrap gap-1">
                          {zone.regions.map((r, j) => (
                            <Badge key={j} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Primary Tasks:</div>
                        <div className="flex flex-wrap gap-1">
                          {zone.tasks.map((t, j) => (
                            <Badge key={j} className="bg-teal-500/20 text-teal-400 text-xs">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-400" />
                Provider Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <Card key={provider.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{provider.logo}</span>
                            <div>
                              <div className="font-semibold text-white">{provider.name}</div>
                              <div className="text-xs text-slate-400">{provider.category}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Badge className={`text-xs ${
                              provider.tier === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                              provider.tier === 'specialized' ? 'bg-violet-500/20 text-violet-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {provider.tier}
                            </Badge>
                            <Badge className={`text-xs ${
                              provider.costTier === 'high' ? 'bg-red-500/20 text-red-400' :
                              provider.costTier === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {provider.costTier} cost
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-slate-300 mb-3">{provider.primaryUse}</div>
                        <div className="mb-2">
                          <div className="text-xs text-slate-400 mb-1">Models:</div>
                          <div className="flex flex-wrap gap-1">
                            {provider.models.slice(0, 3).map((m, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{m}</Badge>
                            ))}
                            {provider.models.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{provider.models.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Regions:</div>
                          <div className="flex flex-wrap gap-1">
                            {provider.regions.slice(0, 4).map((r, j) => (
                              <Badge key={j} className="bg-blue-500/20 text-blue-400 text-xs">{r}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenieProviderCapabilityMatrix;
