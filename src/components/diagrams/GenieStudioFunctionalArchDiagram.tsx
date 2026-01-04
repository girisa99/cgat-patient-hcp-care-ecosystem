import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Users, 
  Layout, 
  MousePointer,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  Mic,
  Video,
  Edit3
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const GenieStudioFunctionalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('user-journeys');

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_FUNCTIONAL_ARCHITECTURE.md', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Doc Link */}
      <Card className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-400" />
              <div>
                <CardTitle className="text-2xl text-white">Functional Architecture</CardTitle>
                <p className="text-emerald-300 text-sm">User Journeys, UI Flows & Feature Matrix</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={openDocs} className="gap-2">
              <FileText className="h-4 w-4" />
              Full Documentation
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-muted/50">
          <TabsTrigger value="user-journeys">User Journeys</TabsTrigger>
          <TabsTrigger value="ui-flows">UI Flows</TabsTrigger>
          <TabsTrigger value="feature-matrix">Feature Matrix</TabsTrigger>
          <TabsTrigger value="personas">User Personas</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <TabsContent value="user-journeys" className="space-y-4">
            {/* Main User Journey SVG */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-300">Primary User Journey: Script to Video</CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1200 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="funcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                    <marker id="arrowFunc" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                  </defs>

                  <rect width="1200" height="400" fill="#0f172a" rx="8" />

                  {/* Journey Steps */}
                  <g transform="translate(30, 50)">
                    {/* Step 1: Create Project */}
                    <g>
                      <circle cx="60" cy="60" r="50" fill="url(#funcGrad1)" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">1</text>
                      <text x="60" y="75" textAnchor="middle" fill="#d1fae5" fontSize="10">CREATE</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="60" y="155" textAnchor="middle" fill="#fff" fontSize="11">New Project</text>
                      <text x="60" y="175" textAnchor="middle" fill="#5eead4" fontSize="9">Set name & type</text>
                    </g>

                    <line x1="120" y1="60" x2="180" y2="60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowFunc)" />

                    {/* Step 2: Write Script */}
                    <g transform="translate(180, 0)">
                      <circle cx="60" cy="60" r="50" fill="url(#funcGrad1)" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">2</text>
                      <text x="60" y="75" textAnchor="middle" fill="#d1fae5" fontSize="10">WRITE</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="60" y="150" textAnchor="middle" fill="#fff" fontSize="11">Script Editor</text>
                      <text x="60" y="165" textAnchor="middle" fill="#5eead4" fontSize="9">Manual or AI</text>
                      <text x="60" y="180" textAnchor="middle" fill="#5eead4" fontSize="9">generated</text>
                    </g>

                    <line x1="300" y1="60" x2="360" y2="60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowFunc)" />

                    {/* Step 3: Enhance */}
                    <g transform="translate(360, 0)">
                      <circle cx="60" cy="60" r="50" fill="#7c3aed" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">3</text>
                      <text x="60" y="75" textAnchor="middle" fill="#e0e7ff" fontSize="10">ENHANCE</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
                      <text x="60" y="150" textAnchor="middle" fill="#fff" fontSize="11">AI Polish</text>
                      <text x="60" y="165" textAnchor="middle" fill="#a5b4fc" fontSize="9">Improve pacing</text>
                      <text x="60" y="180" textAnchor="middle" fill="#a5b4fc" fontSize="9">& clarity</text>
                    </g>

                    <line x1="480" y1="60" x2="540" y2="60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowFunc)" />

                    {/* Step 4: Generate TTS */}
                    <g transform="translate(540, 0)">
                      <circle cx="60" cy="60" r="50" fill="#ec4899" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">4</text>
                      <text x="60" y="75" textAnchor="middle" fill="#fce7f3" fontSize="10">VOICE</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#4c1d47" stroke="#f472b6" strokeWidth="1" />
                      <text x="60" y="150" textAnchor="middle" fill="#fff" fontSize="11">TTS Generate</text>
                      <text x="60" y="165" textAnchor="middle" fill="#f9a8d4" fontSize="9">ElevenLabs</text>
                      <text x="60" y="180" textAnchor="middle" fill="#f9a8d4" fontSize="9">30+ voices</text>
                    </g>

                    <line x1="660" y1="60" x2="720" y2="60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowFunc)" />

                    {/* Step 5: Record */}
                    <g transform="translate(720, 0)">
                      <circle cx="60" cy="60" r="50" fill="#ef4444" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">5</text>
                      <text x="60" y="75" textAnchor="middle" fill="#fecaca" fontSize="10">RECORD</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#450a0a" stroke="#f87171" strokeWidth="1" />
                      <text x="60" y="150" textAnchor="middle" fill="#fff" fontSize="11">Recording</text>
                      <text x="60" y="165" textAnchor="middle" fill="#fca5a5" fontSize="9">Teleprompter</text>
                      <text x="60" y="180" textAnchor="middle" fill="#fca5a5" fontSize="9">+ Camera</text>
                    </g>

                    <line x1="840" y1="60" x2="900" y2="60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowFunc)" />

                    {/* Step 6: Export */}
                    <g transform="translate(900, 0)">
                      <circle cx="60" cy="60" r="50" fill="#f59e0b" />
                      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="24">6</text>
                      <text x="60" y="75" textAnchor="middle" fill="#fef3c7" fontSize="10">EXPORT</text>
                      
                      <rect x="10" y="130" width="100" height="60" rx="8" fill="#422006" stroke="#fbbf24" strokeWidth="1" />
                      <text x="60" y="150" textAnchor="middle" fill="#fff" fontSize="11">Final Video</text>
                      <text x="60" y="165" textAnchor="middle" fill="#fcd34d" fontSize="9">MP4/WebM</text>
                      <text x="60" y="180" textAnchor="middle" fill="#fcd34d" fontSize="9">Download</text>
                    </g>
                  </g>

                  {/* Alternative Paths */}
                  <g transform="translate(30, 240)">
                    <text x="0" y="20" fill="#94a3b8" fontSize="12" fontWeight="bold">ALTERNATIVE PATHS:</text>
                    
                    <rect x="0" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="10" y="57" fill="#94a3b8" fontSize="11">🎯 Quick TTS: Skip to Step 4 → Generate audio only</text>
                    
                    <rect x="370" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="380" y="57" fill="#94a3b8" fontSize="11">📝 Script Only: Steps 1-3 → Export as document</text>
                    
                    <rect x="740" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="750" y="57" fill="#94a3b8" fontSize="11">🎬 Manual Record: Skip TTS → Direct recording</text>
                  </g>

                  {/* Time Estimate */}
                  <g transform="translate(30, 320)">
                    <rect width="1110" height="50" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                    <text x="20" y="30" fill="#6ee7b7" fontSize="12" fontWeight="bold">⏱️ TYPICAL TIME:</text>
                    <text x="150" y="30" fill="#d1fae5" fontSize="11">5-minute video = ~15 minutes total (AI-assisted) | ~45 minutes (fully manual)</text>
                  </g>
                </svg>
              </CardContent>
            </Card>

            {/* Journey Variants */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-violet-900/20 border-violet-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 className="h-5 w-5 text-violet-400" />
                    <span className="text-violet-300 font-semibold">Content Creator</span>
                  </div>
                  <p className="text-sm text-violet-200 mb-2">Focus: Quick content with AI assistance</p>
                  <div className="text-xs text-violet-300 space-y-1">
                    <p>• AI script generation</p>
                    <p>• TTS voiceover</p>
                    <p>• Screen recording</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-900/20 border-emerald-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Training Producer</span>
                  </div>
                  <p className="text-sm text-emerald-200 mb-2">Focus: Professional training videos</p>
                  <div className="text-xs text-emerald-300 space-y-1">
                    <p>• Teleprompter recording</p>
                    <p>• Multi-take editing</p>
                    <p>• Quality review</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-900/20 border-amber-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-300 font-semibold">Marketing Team</span>
                  </div>
                  <p className="text-sm text-amber-200 mb-2">Focus: Branded content at scale</p>
                  <div className="text-xs text-amber-300 space-y-1">
                    <p>• Template library</p>
                    <p>• Batch processing</p>
                    <p>• Brand consistency</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ui-flows" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Layout className="h-5 w-5" />
                  UI Component Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1200 500" className="w-full h-auto">
                  <rect width="1200" height="500" fill="#0f172a" rx="8" />

                  {/* Genie Studio UI */}
                  <g transform="translate(30, 30)">
                    <rect width="550" height="440" rx="12" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" />
                    <rect width="550" height="40" rx="12" fill="#7c3aed" />
                    <text x="275" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">🧞 GENIE STUDIO UI</text>

                    {/* Sidebar */}
                    <g transform="translate(10, 50)">
                      <rect width="120" height="380" rx="8" fill="#312e81" />
                      <text x="60" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">SIDEBAR</text>
                      
                      <rect x="10" y="40" width="100" height="30" rx="4" fill="#4338ca" />
                      <text x="60" y="60" textAnchor="middle" fill="#fff" fontSize="9">📁 Projects</text>
                      
                      <rect x="10" y="80" width="100" height="30" rx="4" fill="#4338ca" />
                      <text x="60" y="100" textAnchor="middle" fill="#fff" fontSize="9">📝 Scripts</text>
                      
                      <rect x="10" y="120" width="100" height="30" rx="4" fill="#4338ca" />
                      <text x="60" y="140" textAnchor="middle" fill="#fff" fontSize="9">🎬 Recordings</text>
                      
                      <rect x="10" y="160" width="100" height="30" rx="4" fill="#4338ca" />
                      <text x="60" y="180" textAnchor="middle" fill="#fff" fontSize="9">📚 Knowledge</text>
                      
                      <rect x="10" y="200" width="100" height="30" rx="4" fill="#4338ca" />
                      <text x="60" y="220" textAnchor="middle" fill="#fff" fontSize="9">⚙️ Settings</text>
                    </g>

                    {/* Main Content Area */}
                    <g transform="translate(140, 50)">
                      <rect width="400" height="380" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                      <text x="200" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">MAIN CONTENT AREA</text>
                      
                      {/* Script Editor */}
                      <rect x="10" y="40" width="380" height="150" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                      <text x="20" y="60" fill="#60a5fa" fontSize="10" fontWeight="bold">Script Editor</text>
                      <rect x="20" y="75" width="350" height="12" rx="2" fill="#1e3a5f" />
                      <rect x="20" y="95" width="280" height="12" rx="2" fill="#1e3a5f" />
                      <rect x="20" y="115" width="320" height="12" rx="2" fill="#1e3a5f" />
                      <rect x="20" y="135" width="200" height="12" rx="2" fill="#1e3a5f" />
                      
                      <rect x="280" y="155" width="100" height="25" rx="4" fill="#7c3aed" />
                      <text x="330" y="172" textAnchor="middle" fill="#fff" fontSize="9">AI Enhance</text>

                      {/* TTS Controls */}
                      <rect x="10" y="200" width="185" height="80" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
                      <text x="20" y="220" fill="#f472b6" fontSize="10" fontWeight="bold">TTS Controls</text>
                      <rect x="20" y="235" width="80" height="20" rx="3" fill="#4c1d47" />
                      <text x="60" y="249" textAnchor="middle" fill="#fff" fontSize="8">Voice: Sarah</text>
                      <rect x="110" y="235" width="70" height="20" rx="3" fill="#059669" />
                      <text x="145" y="249" textAnchor="middle" fill="#fff" fontSize="8">Generate</text>

                      {/* Preview */}
                      <rect x="205" y="200" width="185" height="80" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                      <text x="215" y="220" fill="#fbbf24" fontSize="10" fontWeight="bold">Preview</text>
                      <circle cx="297" cy="250" r="15" fill="#f59e0b" />
                      <text x="297" y="255" textAnchor="middle" fill="#fff" fontSize="12">▶</text>

                      {/* Action Buttons */}
                      <rect x="10" y="295" width="120" height="35" rx="6" fill="#059669" />
                      <text x="70" y="318" textAnchor="middle" fill="#fff" fontSize="11">🎬 Record</text>
                      
                      <rect x="140" y="295" width="120" height="35" rx="6" fill="#3b82f6" />
                      <text x="200" y="318" textAnchor="middle" fill="#fff" fontSize="11">💾 Save</text>
                      
                      <rect x="270" y="295" width="120" height="35" rx="6" fill="#6366f1" />
                      <text x="330" y="318" textAnchor="middle" fill="#fff" fontSize="11">📤 Export</text>
                    </g>
                  </g>

                  {/* Arrow */}
                  <g transform="translate(590, 220)">
                    <rect width="80" height="60" rx="30" fill="#f59e0b" />
                    <text x="40" y="35" textAnchor="middle" fill="#fff" fontSize="20">→</text>
                    <text x="40" y="52" textAnchor="middle" fill="#fff" fontSize="8">Context</text>
                  </g>

                  {/* Recording Studio UI */}
                  <g transform="translate(680, 30)">
                    <rect width="490" height="440" rx="12" fill="#042f2e" stroke="#059669" strokeWidth="2" />
                    <rect width="490" height="40" rx="12" fill="#059669" />
                    <text x="245" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">🎬 RECORDING STUDIO UI</text>

                    {/* Teleprompter */}
                    <g transform="translate(10, 50)">
                      <rect width="230" height="180" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="115" y="25" textAnchor="middle" fill="#5eead4" fontSize="10" fontWeight="bold">📜 TELEPROMPTER</text>
                      
                      <rect x="10" y="40" width="210" height="120" rx="4" fill="#0f172a" />
                      <text x="20" y="65" fill="#e2e8f0" fontSize="9">Welcome to our patient</text>
                      <text x="20" y="85" fill="#fff" fontSize="12" fontWeight="bold">onboarding process...</text>
                      <text x="20" y="105" fill="#94a3b8" fontSize="9">In this video, we will</text>
                      <text x="20" y="125" fill="#64748b" fontSize="9">guide you through...</text>
                      
                      <rect x="10" y="165" width="60" height="10" rx="2" fill="#14b8a6" />
                      <text x="80" y="173" fill="#5eead4" fontSize="8">35% complete</text>
                    </g>

                    {/* Video Preview */}
                    <g transform="translate(250, 50)">
                      <rect width="230" height="180" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="115" y="25" textAnchor="middle" fill="#5eead4" fontSize="10" fontWeight="bold">📹 VIDEO PREVIEW</text>
                      
                      <rect x="10" y="40" width="210" height="120" rx="4" fill="#0f172a" />
                      <circle cx="115" cy="100" r="30" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                      <text x="115" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10">Camera</text>
                    </g>

                    {/* Audio Mixer */}
                    <g transform="translate(10, 240)">
                      <rect width="470" height="80" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="20" y="25" fill="#5eead4" fontSize="10" fontWeight="bold">🎚️ AUDIO MIXER</text>
                      
                      {/* Volume bars */}
                      <g transform="translate(20, 35)">
                        <rect width="80" height="35" rx="4" fill="#0f172a" />
                        <rect x="5" y="20" width="10" height="10" rx="1" fill="#22c55e" />
                        <rect x="20" y="15" width="10" height="15" rx="1" fill="#3b82f6" />
                        <rect x="35" y="25" width="10" height="5" rx="1" fill="#ec4899" />
                        <rect x="50" y="10" width="10" height="20" rx="1" fill="#f59e0b" />
                        <text x="40" y="12" textAnchor="middle" fill="#94a3b8" fontSize="7">Levels</text>
                      </g>
                      
                      <g transform="translate(120, 35)">
                        <rect width="100" height="35" rx="4" fill="#0f172a" />
                        <text x="50" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8">TTS: 80%</text>
                        <rect x="10" y="22" width="80" height="6" rx="2" fill="#1e293b" />
                        <rect x="10" y="22" width="64" height="6" rx="2" fill="#22c55e" />
                      </g>
                      
                      <g transform="translate(240, 35)">
                        <rect width="100" height="35" rx="4" fill="#0f172a" />
                        <text x="50" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8">Music: 20%</text>
                        <rect x="10" y="22" width="80" height="6" rx="2" fill="#1e293b" />
                        <rect x="10" y="22" width="16" height="6" rx="2" fill="#ec4899" />
                      </g>
                      
                      <g transform="translate(360, 35)">
                        <rect width="90" height="35" rx="4" fill="#0f172a" />
                        <text x="45" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8">Ducking</text>
                        <rect x="30" y="20" width="30" height="12" rx="6" fill="#22c55e" />
                        <circle cx="52" cy="26" r="4" fill="#fff" />
                      </g>
                    </g>

                    {/* Recording Controls */}
                    <g transform="translate(10, 330)">
                      <rect width="470" height="100" rx="8" fill="#134e4a" stroke="#14b8a6" strokeWidth="1" />
                      <text x="20" y="25" fill="#5eead4" fontSize="10" fontWeight="bold">🎛️ RECORDING CONTROLS</text>
                      
                      <circle cx="60" cy="65" r="25" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
                      <text x="60" y="70" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">REC</text>
                      
                      <circle cx="130" cy="65" r="20" fill="#0ea5e9" />
                      <text x="130" y="70" textAnchor="middle" fill="#fff" fontSize="14">⏸</text>
                      
                      <circle cx="190" cy="65" r="20" fill="#6366f1" />
                      <text x="190" y="70" textAnchor="middle" fill="#fff" fontSize="14">⏹</text>
                      
                      <rect x="240" y="45" width="80" height="40" rx="6" fill="#059669" />
                      <text x="280" y="62" textAnchor="middle" fill="#fff" fontSize="9">Countdown</text>
                      <text x="280" y="78" textAnchor="middle" fill="#bbf7d0" fontSize="12" fontWeight="bold">3s</text>
                      
                      <rect x="340" y="45" width="80" height="40" rx="6" fill="#f59e0b" />
                      <text x="380" y="70" textAnchor="middle" fill="#fff" fontSize="10">Export</text>
                    </g>
                  </g>
                </svg>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feature-matrix" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle className="h-5 w-5" />
                  Feature Implementation Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-4 text-slate-300">Feature</th>
                        <th className="text-center py-3 px-4 text-slate-300">Priority</th>
                        <th className="text-center py-3 px-4 text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300">Components</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* P0 Features */}
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Project Management</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-emerald-600">P0</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">GenieStudio, ProjectManager</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Script Editor</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-emerald-600">P0</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">ScriptEditor, useScriptEditor</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">TTS Generation</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-emerald-600">P0</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">TTSPanel, useTTSGeneration</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Basic Recording</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-emerald-600">P0</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">RecordingStudio, useMediaRecorder</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Teleprompter</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-emerald-600">P0</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">Teleprompter, useTeleprompter</td>
                      </tr>

                      {/* P1 Features */}
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">AI Script Enhancement</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-blue-600">P1</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">useUniversalAI, script-enhance</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Multi-track Audio</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-blue-600">P1</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-green-600">✓ Done</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">AudioMixer, useAudioMixer</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Screen Recording</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-blue-600">P1</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-yellow-600">○ Partial</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">useScreenCapture</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Audio Ducking</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-blue-600">P1</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-yellow-600">○ Partial</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">AudioMixer</td>
                      </tr>

                      {/* P2 Features */}
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Collaborative Editing</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-amber-600">P2</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-slate-600">○ Planned</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">-</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Version Control</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-amber-600">P2</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-slate-600">○ Planned</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">-</td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="py-3 px-4 text-white">Analytics Dashboard</td>
                        <td className="text-center py-3 px-4"><Badge className="bg-amber-600">P2</Badge></td>
                        <td className="text-center py-3 px-4"><Badge className="bg-yellow-600">○ Partial</Badge></td>
                        <td className="py-3 px-4 text-slate-400 text-xs">GenieAnalyticsPage</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                      <span className="text-xl">👩‍🏫</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Training Coordinator</h3>
                      <p className="text-sm text-violet-300">Healthcare Education</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-violet-400 font-medium">Goals:</p>
                      <ul className="text-violet-200 text-xs ml-2 mt-1 space-y-1">
                        <li>• Create compliant training materials</li>
                        <li>• Ensure consistent messaging</li>
                        <li>• Track completion rates</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-violet-400 font-medium">Key Features Used:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs border-violet-400 text-violet-300">Scripts</Badge>
                        <Badge variant="outline" className="text-xs border-violet-400 text-violet-300">TTS</Badge>
                        <Badge variant="outline" className="text-xs border-violet-400 text-violet-300">Templates</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xl">👨‍💻</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Content Creator</h3>
                      <p className="text-sm text-emerald-300">Marketing Team</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-emerald-400 font-medium">Goals:</p>
                      <ul className="text-emerald-200 text-xs ml-2 mt-1 space-y-1">
                        <li>• Rapid content production</li>
                        <li>• Maintain brand voice</li>
                        <li>• A/B test messaging</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-medium">Key Features Used:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-300">AI Generation</Badge>
                        <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-300">Recording</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center">
                      <span className="text-xl">👩‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Clinical Staff</h3>
                      <p className="text-sm text-amber-300">Patient Education</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-amber-400 font-medium">Goals:</p>
                      <ul className="text-amber-200 text-xs ml-2 mt-1 space-y-1">
                        <li>• Clear patient instructions</li>
                        <li>• Multi-language support</li>
                        <li>• Quick updates</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-amber-400 font-medium">Key Features Used:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-300">TTS</Badge>
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-300">Knowledge Base</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xl">👨‍💼</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Operations Manager</h3>
                      <p className="text-sm text-blue-300">Process Documentation</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-blue-400 font-medium">Goals:</p>
                      <ul className="text-blue-200 text-xs ml-2 mt-1 space-y-1">
                        <li>• Standardize procedures</li>
                        <li>• Train new hires</li>
                        <li>• Audit compliance</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-blue-400 font-medium">Key Features Used:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">Projects</Badge>
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">Analytics</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
