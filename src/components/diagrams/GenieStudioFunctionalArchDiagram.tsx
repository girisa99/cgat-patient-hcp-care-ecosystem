import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Users, 
  Layout, 
  Download,
  ArrowRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const GenieStudioFunctionalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('user-journeys');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_FUNCTIONAL_ARCHITECTURE.md', '_blank');
  };

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-functional-architecture-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Diagram downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-slate-400" />
              <div>
                <CardTitle className="text-2xl text-slate-100">Functional Architecture</CardTitle>
                <p className="text-slate-400 text-sm">User Journeys, UI Flows & Feature Matrix</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="user-journeys" className="data-[state=active]:bg-slate-700">User Journeys</TabsTrigger>
          <TabsTrigger value="ui-flows" className="data-[state=active]:bg-slate-700">UI Flows</TabsTrigger>
          <TabsTrigger value="feature-matrix" className="data-[state=active]:bg-slate-700">Feature Matrix</TabsTrigger>
          <TabsTrigger value="personas" className="data-[state=active]:bg-slate-700">User Personas</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef}>
            <TabsContent value="user-journeys" className="space-y-4">
              {/* Main User Journey SVG */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300">Primary User Journey: Script to Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 400" className="w-full h-auto">
                    <defs>
                      <linearGradient id="funcGradEnterprise" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="100%" stopColor="#334155" />
                      </linearGradient>
                      <marker id="arrowFuncEnt" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                      </marker>
                    </defs>

                    <rect width="1200" height="400" fill="#0f172a" rx="8" />

                    {/* Journey Steps */}
                    <g transform="translate(30, 50)">
                      {/* Step 1: Create Project */}
                      <g>
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">1</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">CREATE</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="155" textAnchor="middle" fill="#e2e8f0" fontSize="11">New Project</text>
                        <text x="60" y="175" textAnchor="middle" fill="#64748b" fontSize="9">Set name & type</text>
                      </g>

                      <line x1="120" y1="60" x2="180" y2="60" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowFuncEnt)" />

                      {/* Step 2: Write Script */}
                      <g transform="translate(180, 0)">
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">2</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">WRITE</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11">Script Editor</text>
                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Manual or AI</text>
                        <text x="60" y="180" textAnchor="middle" fill="#64748b" fontSize="9">generated</text>
                      </g>

                      <line x1="300" y1="60" x2="360" y2="60" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowFuncEnt)" />

                      {/* Step 3: Enhance */}
                      <g transform="translate(360, 0)">
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">3</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">ENHANCE</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11">AI Polish</text>
                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Improve pacing</text>
                        <text x="60" y="180" textAnchor="middle" fill="#64748b" fontSize="9">& clarity</text>
                      </g>

                      <line x1="480" y1="60" x2="540" y2="60" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowFuncEnt)" />

                      {/* Step 4: Generate TTS */}
                      <g transform="translate(540, 0)">
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">4</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">VOICE</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11">TTS Generate</text>
                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">ElevenLabs</text>
                        <text x="60" y="180" textAnchor="middle" fill="#64748b" fontSize="9">30+ voices</text>
                      </g>

                      <line x1="660" y1="60" x2="720" y2="60" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowFuncEnt)" />

                      {/* Step 5: Record */}
                      <g transform="translate(720, 0)">
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">5</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">RECORD</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11">Recording</text>
                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Teleprompter</text>
                        <text x="60" y="180" textAnchor="middle" fill="#64748b" fontSize="9">+ Camera</text>
                      </g>

                      <line x1="840" y1="60" x2="900" y2="60" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowFuncEnt)" />

                      {/* Step 6: Export */}
                      <g transform="translate(900, 0)">
                        <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="600">6</text>
                        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">EXPORT</text>
                        
                        <rect x="10" y="130" width="100" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11">Final Video</text>
                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">MP4/WebM</text>
                        <text x="60" y="180" textAnchor="middle" fill="#64748b" fontSize="9">Download</text>
                      </g>
                    </g>

                    {/* Alternative Paths */}
                    <g transform="translate(30, 240)">
                      <text x="0" y="20" fill="#64748b" fontSize="12" fontWeight="600">ALTERNATIVE PATHS:</text>
                      
                      <rect x="0" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="10" y="57" fill="#94a3b8" fontSize="11">Quick TTS: Skip to Step 4 → Generate audio only</text>
                      
                      <rect x="370" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="380" y="57" fill="#94a3b8" fontSize="11">Script Only: Steps 1-3 → Export as document</text>
                      
                      <rect x="740" y="35" width="350" height="35" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="750" y="57" fill="#94a3b8" fontSize="11">Manual Record: Skip TTS → Direct recording</text>
                    </g>

                    {/* Time Estimate */}
                    <g transform="translate(30, 320)">
                      <rect width="1110" height="50" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="600">TYPICAL TIME:</text>
                      <text x="150" y="30" fill="#64748b" fontSize="11">5-minute video = ~15 minutes total (AI-assisted) | ~45 minutes (fully manual)</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Journey Variants */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-300 font-semibold">Content Creator</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">Focus: Quick content with AI assistance</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• AI script generation</p>
                      <p>• TTS voiceover</p>
                      <p>• Screen recording</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-300 font-semibold">Training Producer</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">Focus: Professional training videos</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Teleprompter recording</p>
                      <p>• Multi-take editing</p>
                      <p>• Quality review</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-slate-300 font-semibold">Marketing Team</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">Focus: Branded content at scale</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Template library</p>
                      <p>• Batch processing</p>
                      <p>• Brand consistency</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ui-flows" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-300">
                    <Layout className="h-5 w-5" />
                    UI Component Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 500" className="w-full h-auto">
                    <rect width="1200" height="500" fill="#0f172a" rx="8" />

                    {/* Genie Studio UI */}
                    <g transform="translate(30, 30)">
                      <rect width="550" height="440" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <rect width="550" height="40" rx="12" fill="#334155" />
                      <text x="275" y="26" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="600">GENIE STUDIO UI</text>

                      {/* Sidebar */}
                      <g transform="translate(10, 50)">
                        <rect width="120" height="380" rx="8" fill="#0f172a" />
                        <text x="60" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">SIDEBAR</text>
                        
                        <rect x="10" y="40" width="100" height="30" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="60" textAnchor="middle" fill="#e2e8f0" fontSize="9">Projects</text>
                        
                        <rect x="10" y="80" width="100" height="30" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="100" textAnchor="middle" fill="#e2e8f0" fontSize="9">Scripts</text>
                        
                        <rect x="10" y="120" width="100" height="30" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="140" textAnchor="middle" fill="#e2e8f0" fontSize="9">Recordings</text>
                        
                        <rect x="10" y="160" width="100" height="30" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="180" textAnchor="middle" fill="#e2e8f0" fontSize="9">Knowledge</text>
                        
                        <rect x="10" y="200" width="100" height="30" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="60" y="220" textAnchor="middle" fill="#e2e8f0" fontSize="9">Settings</text>
                      </g>

                      {/* Main Content Area */}
                      <g transform="translate(140, 50)">
                        <rect width="400" height="380" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                        <text x="200" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">MAIN CONTENT AREA</text>
                        
                        {/* Script Editor */}
                        <rect x="10" y="40" width="380" height="150" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="20" y="60" fill="#94a3b8" fontSize="10" fontWeight="600">Script Editor</text>
                        <rect x="20" y="75" width="350" height="12" rx="2" fill="#0f172a" />
                        <rect x="20" y="95" width="280" height="12" rx="2" fill="#0f172a" />
                        <rect x="20" y="115" width="320" height="12" rx="2" fill="#0f172a" />
                        <rect x="20" y="135" width="200" height="12" rx="2" fill="#0f172a" />
                        
                        <rect x="280" y="155" width="100" height="25" rx="4" fill="#475569" />
                        <text x="330" y="172" textAnchor="middle" fill="#e2e8f0" fontSize="9">AI Enhance</text>

                        {/* TTS Controls */}
                        <rect x="10" y="200" width="185" height="80" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="20" y="220" fill="#94a3b8" fontSize="10" fontWeight="600">TTS Controls</text>
                        <rect x="20" y="235" width="80" height="20" rx="3" fill="#0f172a" />
                        <text x="60" y="249" textAnchor="middle" fill="#e2e8f0" fontSize="8">Voice: Sarah</text>
                        <rect x="110" y="235" width="70" height="20" rx="3" fill="#475569" />
                        <text x="145" y="249" textAnchor="middle" fill="#e2e8f0" fontSize="8">Generate</text>

                        {/* Preview */}
                        <rect x="205" y="200" width="185" height="80" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="215" y="220" fill="#94a3b8" fontSize="10" fontWeight="600">Preview</text>
                        <circle cx="297" cy="250" r="15" fill="#475569" />
                        <text x="297" y="255" textAnchor="middle" fill="#e2e8f0" fontSize="12">▶</text>

                        {/* Action Buttons */}
                        <rect x="10" y="295" width="120" height="35" rx="6" fill="#475569" />
                        <text x="70" y="318" textAnchor="middle" fill="#e2e8f0" fontSize="11">Record</text>
                        
                        <rect x="140" y="295" width="120" height="35" rx="6" fill="#334155" />
                        <text x="200" y="318" textAnchor="middle" fill="#e2e8f0" fontSize="11">Save</text>
                        
                        <rect x="270" y="295" width="120" height="35" rx="6" fill="#334155" />
                        <text x="330" y="318" textAnchor="middle" fill="#e2e8f0" fontSize="11">Export</text>
                      </g>
                    </g>

                    {/* Arrow between UIs */}
                    <g transform="translate(590, 250)">
                      <line x1="0" y1="0" x2="30" y2="0" stroke="#475569" strokeWidth="3" markerEnd="url(#arrowFuncEnt)" />
                    </g>

                    {/* Recording Studio UI */}
                    <g transform="translate(620, 30)">
                      <rect width="550" height="440" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <rect width="550" height="40" rx="12" fill="#334155" />
                      <text x="275" y="26" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="600">RECORDING STUDIO UI</text>

                      {/* Video Preview */}
                      <g transform="translate(10, 50)">
                        <rect width="530" height="200" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                        <text x="265" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">CAMERA PREVIEW</text>
                        <rect x="20" y="40" width="330" height="140" rx="6" fill="#1e293b" />
                        <text x="185" y="115" textAnchor="middle" fill="#64748b" fontSize="12">Camera Feed</text>
                        
                        {/* PiP */}
                        <rect x="370" y="40" width="140" height="80" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="440" y="85" textAnchor="middle" fill="#64748b" fontSize="9">Screen Share</text>
                      </g>

                      {/* Teleprompter */}
                      <g transform="translate(10, 260)">
                        <rect width="350" height="120" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                        <text x="175" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">TELEPROMPTER</text>
                        <rect x="20" y="40" width="310" height="12" rx="2" fill="#1e293b" />
                        <rect x="20" y="58" width="280" height="12" rx="2" fill="#1e293b" />
                        <rect x="20" y="76" width="300" height="12" rx="2" fill="#1e293b" />
                        <rect x="20" y="94" width="250" height="12" rx="2" fill="#334155" />
                      </g>

                      {/* Controls */}
                      <g transform="translate(370, 260)">
                        <rect width="170" height="120" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                        <text x="85" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">CONTROLS</text>
                        
                        <circle cx="85" cy="70" r="30" fill="#475569" stroke="#64748b" strokeWidth="2" />
                        <text x="85" y="75" textAnchor="middle" fill="#e2e8f0" fontSize="16">●</text>
                        <text x="85" y="110" textAnchor="middle" fill="#94a3b8" fontSize="9">REC</text>
                      </g>

                      {/* Audio Levels */}
                      <g transform="translate(10, 390)">
                        <rect width="530" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                        <text x="20" y="25" fill="#94a3b8" fontSize="9">Audio Level:</text>
                        <rect x="100" y="12" width="350" height="16" rx="3" fill="#1e293b" />
                        <rect x="100" y="12" width="220" height="16" rx="3" fill="#475569" />
                      </g>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feature-matrix" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300">Feature Implementation Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">P0 Core</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">P1 Enhanced</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">P2 Advanced</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Script Creation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'AI Script Generation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'TTS Voice Generation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'Teleprompter Recording', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'Multi-track Audio', p0: false, p1: true, p2: true, status: 'done' },
                          { name: 'Screen Recording', p0: false, p1: true, p2: true, status: 'partial' },
                          { name: 'Audio Ducking', p0: false, p1: true, p2: true, status: 'partial' },
                          { name: 'Collaborative Editing', p0: false, p1: false, p2: true, status: 'planned' },
                          { name: 'Version Control', p0: false, p1: false, p2: true, status: 'planned' },
                          { name: 'Analytics Dashboard', p0: false, p1: false, p2: true, status: 'partial' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-slate-800">
                            <td className="py-3 px-4 text-slate-300">{row.name}</td>
                            <td className="text-center py-3 px-4">
                              {row.p0 ? <span className="text-slate-400">●</span> : <span className="text-slate-700">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.p1 ? <span className="text-slate-400">●</span> : <span className="text-slate-700">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.p2 ? <span className="text-slate-400">●</span> : <span className="text-slate-700">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant="outline" className={
                                row.status === 'done' ? 'border-slate-500 text-slate-400' :
                                row.status === 'partial' ? 'border-slate-600 text-slate-500' :
                                'border-slate-700 text-slate-600'
                              }>
                                {row.status === 'done' ? '✓ Done' : row.status === 'partial' ? '◐ Partial' : '○ Planned'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: 'Content Creator',
                    role: 'Individual / Small Team',
                    goals: ['Quick video production', 'AI-assisted content', 'Social media ready'],
                    pain: ['Time constraints', 'Limited resources', 'Technical complexity']
                  },
                  {
                    title: 'Training Manager',
                    role: 'L&D Department',
                    goals: ['Professional training videos', 'Consistent quality', 'Compliance tracking'],
                    pain: ['Review cycles', 'Version control', 'Multi-stakeholder approval']
                  },
                  {
                    title: 'Marketing Lead',
                    role: 'Marketing Team',
                    goals: ['Brand consistency', 'High volume output', 'Performance analytics'],
                    pain: ['Template management', 'Asset organization', 'Campaign coordination']
                  },
                  {
                    title: 'Healthcare Educator',
                    role: 'Clinical Education',
                    goals: ['Accurate medical content', 'Regulatory compliance', 'Patient education'],
                    pain: ['Medical accuracy', 'Legal review', 'Accessibility requirements']
                  }
                ].map((persona, i) => (
                  <Card key={i} className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-200 text-lg">{persona.title}</CardTitle>
                          <p className="text-slate-500 text-sm">{persona.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-2">GOALS</p>
                        <div className="space-y-1">
                          {persona.goals.map((g, j) => (
                            <p key={j} className="text-slate-300 text-sm">• {g}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-2">PAIN POINTS</p>
                        <div className="space-y-1">
                          {persona.pain.map((p, j) => (
                            <p key={j} className="text-slate-500 text-sm">• {p}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default GenieStudioFunctionalArchDiagram;
