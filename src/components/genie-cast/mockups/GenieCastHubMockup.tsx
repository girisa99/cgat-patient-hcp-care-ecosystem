/**
 * GENIE CAST HUB MOCKUP - UI Preview Before Implementation
 * 
 * Demonstrates the consolidated workflow:
 * Templates → Blueprint → Assets → Messaging → Generate → Library → Distribute → Analytics
 * 
 * Features:
 * - Progressive disclosure (Simple/Standard/Advanced modes)
 * - Template Gallery first approach
 * - Visual Blueprint Builder preview
 * - Internal vs External user views
 */

import React, { useState } from 'react';
import {
  LayoutTemplate,
  Puzzle,
  ImageIcon,
  MessageSquare,
  Play,
  Library,
  Calendar,
  BarChart3,
  ChevronRight,
  Sparkles,
  Zap,
  Settings2,
  GripVertical,
  Plus,
  Clock,
  Users,
  Globe,
  Check,
  Eye,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type WorkflowMode = 'simple' | 'standard' | 'advanced';
type UserType = 'internal' | 'external';

const WORKFLOW_STEPS = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Start from pre-made blueprints' },
  { id: 'blueprint', label: 'Blueprint', icon: Puzzle, description: 'Customize chapter structure' },
  { id: 'assets', label: 'Assets', icon: ImageIcon, description: 'Upload screenshots & media' },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare, description: 'Define hooks & CTAs' },
  { id: 'generate', label: 'Generate', icon: Play, description: 'AI video production' },
  { id: 'library', label: 'Library', icon: Library, description: 'Review & edit outputs' },
  { id: 'distribute', label: 'Distribute', icon: Calendar, description: 'Schedule & publish' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Track performance' },
];

const TEMPLATE_GALLERY = [
  { id: 'product-demo', name: 'Product Demo', chapters: 6, duration: '3-5 min', style: 'Educational', popular: true },
  { id: 'social-ad', name: 'Social Ad', chapters: 3, duration: '30-60s', style: 'Hook', popular: true },
  { id: 'feature-spotlight', name: 'Feature Spotlight', chapters: 4, duration: '2-3 min', style: 'Storytelling', popular: false },
  { id: 'tutorial', name: 'Tutorial', chapters: 8, duration: '5-10 min', style: 'Educational', popular: false },
  { id: 'testimonial', name: 'Customer Story', chapters: 5, duration: '2-4 min', style: 'UGC Avatar', popular: true },
  { id: 'announcement', name: 'Launch Announcement', chapters: 4, duration: '1-2 min', style: '3D Animated', popular: false },
];

const CHAPTER_TYPES = [
  { id: 'hook', name: 'Hook Opener', duration: '5-10s', color: 'bg-red-500' },
  { id: 'problem', name: 'Pain Point', duration: '15-20s', color: 'bg-orange-500' },
  { id: 'solution', name: 'Solution Reveal', duration: '20-30s', color: 'bg-green-500' },
  { id: 'feature', name: 'Feature Demo', duration: '30-45s', color: 'bg-blue-500' },
  { id: 'social-proof', name: 'Social Proof', duration: '15-20s', color: 'bg-purple-500' },
  { id: 'cta', name: 'Call to Action', duration: '10-15s', color: 'bg-pink-500' },
];

const VIDEO_STYLES = [
  { id: 'educational', name: 'Educational', icon: '📚' },
  { id: 'hook', name: 'Hook Videos', icon: '🎣' },
  { id: 'storytelling', name: 'Storytelling', icon: '📖' },
  { id: 'ugc-avatar', name: 'UGC Avatar', icon: '🧑‍💼' },
  { id: '3d-animated', name: '3D Animated', icon: '🎮' },
  { id: 'anime', name: 'Anime Style', icon: '🎨' },
];

export const GenieCastHubMockup: React.FC = () => {
  const [mode, setMode] = useState<WorkflowMode>('standard');
  const [userType, setUserType] = useState<UserType>('internal');
  const [activeStep, setActiveStep] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('educational');

  // Filter steps based on user type
  const visibleSteps = userType === 'external' 
    ? WORKFLOW_STEPS.filter(s => ['templates', 'generate', 'library', 'distribute'].includes(s.id))
    : WORKFLOW_STEPS;

  // Filter steps based on mode
  const modeSteps = mode === 'simple' 
    ? visibleSteps.filter(s => ['templates', 'generate', 'library'].includes(s.id))
    : visibleSteps;

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Mockup Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Genie Cast Hub</h1>
            <p className="text-xs text-muted-foreground">Unified Video Production Workflow</p>
          </div>
          <Badge variant="outline" className="ml-2">UI MOCKUP</Badge>
        </div>

        {/* Mode & User Type Toggles */}
        <div className="flex items-center gap-6">
          {/* User Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View as:</span>
            <Button
              variant={userType === 'internal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserType('internal')}
              className="h-7 text-xs"
            >
              Internal Admin
            </Button>
            <Button
              variant={userType === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserType('external')}
              className="h-7 text-xs"
            >
              External User
            </Button>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex rounded-lg border overflow-hidden">
              {(['simple', 'standard', 'advanced'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-3 py-1.5 text-xs capitalize transition-colors",
                    mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg overflow-x-auto">
        {modeSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isPast = modeSteps.findIndex(s => s.id === activeStep) > index;
          
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all whitespace-nowrap",
                  isActive && "bg-primary text-primary-foreground",
                  isPast && !isActive && "text-primary",
                  !isActive && !isPast && "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  isActive && "bg-primary-foreground/20",
                  isPast && !isActive && "bg-primary/20"
                )}>
                  {isPast ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </button>
              {index < modeSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Context/Help */}
        <div className="col-span-3 space-y-4">
          {/* AI Assistant */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                Ask Genie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                "Create a 60-second social ad for Genie Spark targeting content creators"
              </p>
              <Button size="sm" className="w-full h-8 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-Configure
              </Button>
            </CardContent>
          </Card>

          {/* Current Step Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {WORKFLOW_STEPS.find(s => s.id === activeStep)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {WORKFLOW_STEPS.find(s => s.id === activeStep)?.description}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {userType === 'internal' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Production Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Videos Today</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Languages</span>
                  <span className="font-medium">14</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Queue</span>
                  <span className="font-medium">7 pending</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {/* Templates Step */}
          {activeStep === 'templates' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5" />
                    Template Gallery
                  </CardTitle>
                  {userType === 'internal' && (
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Create Template
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {TEMPLATE_GALLERY.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setActiveStep(mode === 'simple' ? 'generate' : 'blueprint');
                      }}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all hover:border-primary hover:bg-primary/5",
                        selectedTemplate === template.id && "border-primary bg-primary/10"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        {template.popular && (
                          <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Puzzle className="w-3 h-3" />
                          {template.chapters} chapters
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.duration}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {template.style}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blueprint Builder Step */}
          {activeStep === 'blueprint' && mode !== 'simple' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="w-5 h-5" />
                    Blueprint Builder
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Style:</span>
                    <select 
                      className="text-xs border rounded px-2 py-1 bg-background"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                    >
                      {VIDEO_STYLES.map(style => (
                        <option key={style.id} value={style.id}>
                          {style.icon} {style.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Timeline Preview */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">Timeline Preview</span>
                    <Badge variant="outline" className="text-[10px]">Drag to reorder</Badge>
                  </div>
                  <div className="flex gap-1">
                    {CHAPTER_TYPES.slice(0, 4).map((chapter, i) => (
                      <div
                        key={chapter.id}
                        className={cn(
                          "flex-1 h-8 rounded flex items-center justify-center text-white text-[10px] font-medium cursor-grab",
                          chapter.color
                        )}
                      >
                        <GripVertical className="w-3 h-3 mr-1 opacity-50" />
                        {chapter.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapter Library */}
                <div>
                  <h4 className="text-xs font-medium mb-2">Available Chapters</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {CHAPTER_TYPES.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="p-2 border rounded-lg hover:border-primary cursor-grab transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("w-3 h-3 rounded", chapter.color)} />
                          <span className="text-xs font-medium">{chapter.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{chapter.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveStep('templates')}>
                    Back
                  </Button>
                  <Button size="sm" onClick={() => setActiveStep('assets')}>
                    Continue to Assets
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Step */}
          {activeStep === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Generate Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Quick Generate
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Single video with selected template
                    </p>
                    <Button size="sm" className="w-full">
                      Generate Now
                    </Button>
                  </div>

                  {userType === 'internal' && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        Matrix Generation
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Batch across languages & products
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Open Matrix
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Preview Configuration</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-background rounded">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="ml-1 font-medium">Product Demo</span>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <span className="text-muted-foreground">Style:</span>
                      <span className="ml-1 font-medium">Educational</span>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-medium">~3 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other steps show placeholder */}
          {!['templates', 'blueprint', 'generate'].includes(activeStep) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(WORKFLOW_STEPS.find(s => s.id === activeStep)?.icon || 'div', { className: 'w-5 h-5' })}
                  {WORKFLOW_STEPS.find(s => s.id === activeStep)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {WORKFLOW_STEPS.find(s => s.id === activeStep)?.description}
                    </p>
                    <Badge variant="outline">Mockup Placeholder</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer - Mode Comparison */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-medium">Mode Comparison:</span>
              <span className="text-muted-foreground">
                🟢 Simple: {WORKFLOW_STEPS.filter(s => ['templates', 'generate', 'library'].includes(s.id)).length} steps
              </span>
              <span className="text-muted-foreground">
                🟡 Standard: {WORKFLOW_STEPS.length} steps
              </span>
              <span className="text-muted-foreground">
                🔴 Advanced: {WORKFLOW_STEPS.length} steps + custom blueprints
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">User:</span>
              <Badge variant={userType === 'internal' ? 'default' : 'secondary'}>
                {userType === 'internal' ? 'Internal (Full Access)' : 'External (Limited)'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieCastHubMockup;
