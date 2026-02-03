/**
 * Genie Cast Flow Diagram
 * Visual representation of the video production pipeline
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FlowStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  items?: string[];
}

const FlowStep: React.FC<FlowStepProps> = ({ icon, title, description, color, items }) => (
  <div className={`p-4 rounded-lg border-2 ${color} bg-card`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <p className="text-xs text-muted-foreground mb-2">{description}</p>
    {items && (
      <ul className="text-xs space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Arrow: React.FC<{ direction?: 'right' | 'down' }> = ({ direction = 'right' }) => (
  <div className="flex items-center justify-center px-2">
    {direction === 'right' ? (
      <ArrowRight className="w-5 h-5 text-muted-foreground" />
    ) : (
      <ArrowDown className="w-5 h-5 text-muted-foreground" />
    )}
  </div>
);

export const GenieCastFlowDiagram: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          Genie Cast Production Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Input Sources */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            1. Asset Capture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FlowStep
              icon={<Camera className="w-4 h-4 text-blue-500" />}
              title="Screenshots"
              description="Capture product UI for video visuals"
              color="border-blue-500/50"
              items={['Manual upload', 'Auto-capture (html2canvas)', 'Change detection alerts']}
            />
            <FlowStep
              icon={<MessageSquare className="w-4 h-4 text-amber-500" />}
              title="AI Messaging"
              description="Generate hooks, CTAs, and scripts"
              color="border-amber-500/50"
              items={['Feature discovery', 'Bi-weekly feedback analysis', 'Admin approval workflow']}
            />
          </div>
        </div>

        <Arrow direction="down" />

        {/* Row 2: Orchestration */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            2. Orchestration
          </h3>
          <FlowStep
            icon={<Settings2 className="w-4 h-4 text-purple-500" />}
            title="Genie Cast Service"
            description="Validates assets and coordinates generation"
            color="border-purple-500/50"
            items={['Check screenshot readiness', 'Verify approved messaging', 'Build localized scripts']}
          />
        </div>

        <Arrow direction="down" />

        {/* Row 3: Generation Modes */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            3. Generation Modes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FlowStep
              icon={<Zap className="w-4 h-4 text-green-500" />}
              title="Quick Generate"
              description="All products, selected languages"
              color="border-green-500/50"
            />
            <FlowStep
              icon={<Grid3X3 className="w-4 h-4 text-indigo-500" />}
              title="Matrix Generate"
              description="14 langs × 8 products × 4 tiers"
              color="border-indigo-500/50"
            />
            <FlowStep
              icon={<Film className="w-4 h-4 text-pink-500" />}
              title="Feature Video"
              description="Single feature focus"
              color="border-pink-500/50"
            />
          </div>
        </div>

        <Arrow direction="down" />

        {/* Row 4: Regional Routing */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            4. Regional Routing (4-Zone)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <Globe className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Claude Zone</p>
              <p className="text-[10px] text-muted-foreground">EN, ES, FR, PT</p>
              <p className="text-[10px] text-blue-500">ElevenLabs</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
              <Globe className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Alibaba Zone</p>
              <p className="text-[10px] text-muted-foreground">ZH, JA, KO</p>
              <p className="text-[10px] text-orange-500">CosyVoice</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
              <Globe className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Gemini Zone</p>
              <p className="text-[10px] text-muted-foreground">HI, AR, BN, ID</p>
              <p className="text-[10px] text-emerald-500">Azure Neural</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
              <Globe className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Global Fallback</p>
              <p className="text-[10px] text-muted-foreground">Other langs</p>
              <p className="text-[10px] text-gray-500">GPT-4o</p>
            </div>
          </div>
        </div>

        <Arrow direction="down" />

        {/* Row 5: Voice & Video */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            5. Voice & Video Assembly
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FlowStep
              icon={<Volume2 className="w-4 h-4 text-cyan-500" />}
              title="TTS Generation"
              description="Native voiceover per language"
              color="border-cyan-500/50"
              items={['Localized scripts', 'Regional accents', 'Approved messaging']}
            />
            <FlowStep
              icon={<Video className="w-4 h-4 text-red-500" />}
              title="Video Assembly"
              description="genie-cast-assembler Edge Function"
              color="border-red-500/50"
              items={['Screenshots + Audio', 'Optional: AI Avatar', 'Optional: 3D Product']}
            />
          </div>
        </div>

        <Arrow direction="down" />

        {/* Row 6: Publish */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            6. Publish & Sync
          </h3>
          <FlowStep
            icon={<Upload className="w-4 h-4 text-teal-500" />}
            title="Output Destinations"
            description="Automatic sync to all channels"
            color="border-teal-500/50"
            items={['Landing Page Hero', 'Content Library', 'Video Analytics', 'Feedback Loop (bi-weekly)']}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GenieCastFlowDiagram;
