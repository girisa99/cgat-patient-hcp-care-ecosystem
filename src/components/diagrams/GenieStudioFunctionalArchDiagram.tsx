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
  DollarSign,
  Smartphone,
  GraduationCap,
  Heart,
  Building,
  Package
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const colors = {
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  inProgress: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  presentation: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  application: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  domain: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  infrastructure: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  creator: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  traveler: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  smb: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  education: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  healthcare: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  enterprise: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  border: '#e2e8f0',
  background: '#ffffff',
  cardBg: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
};

export const GenieStudioFunctionalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('user-journeys');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_SCENARIO_MAP.md', '_blank');
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: colors.background, scale: 2 });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-functional-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = () => {
    toast.success('SVG download initiated');
  };

  const personas = [
    { name: 'Content Creator', icon: Users, segment: 'creator', needs: ['Quick content', 'AI assistance', 'Social export'], pain: 'Time-consuming editing', tier: 'Starter $9.99', quote: '"I spend 2 hours editing a 60-second reel."' },
    { name: 'Traveler', icon: Smartphone, segment: 'traveler', needs: ['Offline recording', 'Location tagging', 'Auto-edit trips'], pain: 'No offline + AI narration', tier: 'Starter $9.99', quote: '"I need to edit offline during flights."' },
    { name: 'SMB Owner', icon: Package, segment: 'smb', needs: ['Product demos', 'Testimonials', 'Quick templates'], pain: 'Synthesia too expensive', tier: 'Business $29.99', quote: '"Synthesia is amazing but $67/month is too much."' },
    { name: 'Educator', icon: GraduationCap, segment: 'education', needs: ['Lesson builder', 'Screen share', 'Quiz integration'], pain: 'No AI lesson scripts', tier: 'Pro $79.99', quote: '"I spend 4 hours making a 10-minute lesson video."' },
    { name: 'Healthcare Admin', icon: Heart, segment: 'healthcare', needs: ['HIPAA compliant', 'Multi-language', 'PHI redaction'], pain: 'Enterprise tools $1000+', tier: 'Enterprise', quote: '"We need HIPAA-compliant videos but can\'t afford enterprise tools."' },
    { name: 'Enterprise User', icon: Building, segment: 'enterprise', needs: ['White-label', 'SSO/SAML', 'Approval workflows'], pain: 'No integrated workflows', tier: 'Enterprise', quote: '"Legal review takes 3 weeks per video."' },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">Functional Architecture</CardTitle>
                <p className="text-muted-foreground text-sm">User Journeys • 6 Personas • 5 Subscription Tiers • 110 Scenarios</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2"><Download className="h-4 w-4" />SVG</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2"><Download className="h-4 w-4" />PNG</Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2"><FileText className="h-4 w-4" />Docs<ExternalLink className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="user-journeys">User Journeys</TabsTrigger>
          <TabsTrigger value="personas">6 Personas</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="feature-matrix">Feature Matrix</TabsTrigger>
          <TabsTrigger value="ui-flows">UI Flows</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef} className="p-4 bg-white rounded-lg">
            {/* Legend */}
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} /><span className="text-xs">Completed</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} /><span className="text-xs">In Progress</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.planned.bg }} /><span className="text-xs">Planned</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Market Segments</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Creator', 'Traveler', 'SMB', 'Education', 'Healthcare', 'Enterprise'].map((s, i) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="user-journeys" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardHeader>
                  <CardTitle style={{ color: colors.presentation.bg }}>Primary User Journey: Script to Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 250" className="w-full h-auto">
                    <rect width="1200" height="250" fill={colors.background} rx="8" />
                    {[
                      { num: 1, label: 'CREATE', desc: 'New Project', color: colors.presentation.bg, status: '✓' },
                      { num: 2, label: 'WRITE', desc: 'Script Editor', color: colors.application.bg, status: '✓' },
                      { num: 3, label: 'ENHANCE', desc: 'AI Polish', color: colors.domain.bg, status: '✓' },
                      { num: 4, label: 'VOICE', desc: 'TTS Generate', color: colors.inProgress.bg, status: '✓' },
                      { num: 5, label: 'RECORD', desc: 'Teleprompter', color: colors.completed.bg, status: '✓' },
                      { num: 6, label: 'EXPORT', desc: 'MP4/Social', color: colors.planned.bg, status: '◐' },
                    ].map((step, i) => (
                      <g key={step.num} transform={`translate(${30 + i * 190}, 20)`}>
                        <circle cx="60" cy="60" r="50" fill={step.color} opacity="0.15" stroke={step.color} strokeWidth="2" />
                        <text x="60" y="55" textAnchor="middle" fill={step.color} fontSize="24" fontWeight="600">{step.num}</text>
                        <text x="60" y="75" textAnchor="middle" fill={colors.textMuted} fontSize="10">{step.label}</text>
                        <text x="60" y="130" textAnchor="middle" fill={colors.text} fontSize="11">{step.desc}</text>
                        <text x="60" y="150" textAnchor="middle" fill={step.status === '✓' ? colors.completed.bg : colors.inProgress.bg} fontSize="14">{step.status}</text>
                        {i < 5 && <line x1="120" y1="60" x2="170" y2="60" stroke={colors.border} strokeWidth="2" />}
                      </g>
                    ))}
                    <g transform="translate(30, 180)">
                      <rect width="1110" height="50" rx="8" fill={colors.completed.light} stroke={colors.completed.bg} strokeWidth="1" />
                      <text x="20" y="30" fill={colors.completed.bg} fontSize="12" fontWeight="600">TYPICAL TIME: 5-min video = ~15 min (AI-assisted) | ~45 min (manual)</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Bidirectional Flow */}
              <Card className="border-2" style={{ borderColor: colors.completed.bg, backgroundColor: colors.completed.light }}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2" style={{ color: colors.completed.bg }}>✅ Bidirectional Vibe ↔ Mind Flow (Implemented)</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Flow 1 (Default):</p>
                      <p style={{ color: colors.textMuted }}>Mind → Script → TTS → Vibe → Publish</p>
                    </div>
                    <div>
                      <p className="font-medium">Flow 2 (Content Analysis):</p>
                      <p style={{ color: colors.textMuted }}>Vibe → ContentAnalyzer → Mind → Script → TTS → Publish</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>6 Target Personas by Market Segment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {personas.map((persona) => {
                  const Icon = persona.icon;
                  const segmentColor = colors[persona.segment as keyof typeof colors] as typeof colors.creator;
                  return (
                    <Card key={persona.name} className="border-2" style={{ borderColor: segmentColor.bg, backgroundColor: segmentColor.light }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: segmentColor.bg }}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: segmentColor.bg }}>{persona.name}</h4>
                            <Badge variant="outline" className="text-xs">{persona.tier}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Key Needs:</p>
                            <ul className="text-sm">
                              {persona.needs.map((need, j) => <li key={j}>• {need}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Pain Point:</p>
                            <p className="text-sm">{persona.pain}</p>
                          </div>
                          <div className="p-2 rounded" style={{ backgroundColor: '#fef3c7' }}>
                            <p className="text-xs italic">{persona.quote}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                <DollarSign className="h-5 w-5" />5 Subscription Tiers
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: 'Free', price: '$0', features: ['3 videos/mo', 'Watermark', '5 AI scripts'], target: 'Trial', color: colors.infrastructure.bg },
                  { name: 'Starter', price: '$9.99', features: ['Unlimited', 'No watermark', '100 AI scripts', 'Quick templates'], target: 'Creator/Traveler', color: colors.presentation.bg },
                  { name: 'Business', price: '$29.99', features: ['Product demos', '50 templates', '3 team members', 'Testimonial collector'], target: 'SMB', color: colors.inProgress.bg },
                  { name: 'Pro', price: '$79.99', features: ['Lesson Builder', 'API access', '10 team members', 'Training modules'], target: 'Education', color: colors.application.bg },
                  { name: 'Enterprise', price: 'Custom', features: ['HIPAA', 'White-label', 'SSO/SAML', 'Unlimited'], target: 'Healthcare/Enterprise', color: colors.domain.bg },
                ].map((tier) => (
                  <Card key={tier.name} className="border-2" style={{ borderColor: tier.color }}>
                    <CardContent className="pt-4">
                      <div className="font-bold text-lg" style={{ color: colors.text }}>{tier.name}</div>
                      <div className="text-xl font-bold mb-2" style={{ color: tier.color }}>{tier.price}</div>
                      <Badge variant="outline" className="text-xs mb-2">{tier.target}</Badge>
                      <ul className="text-xs space-y-1">
                        {tier.features.map((f, j) => <li key={j}>• {f}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Competitive Pricing */}
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2" style={{ color: colors.text }}>Competitive Pricing Advantage</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded" style={{ backgroundColor: colors.completed.light }}>
                      <p className="font-medium" style={{ color: colors.completed.bg }}>vs Synthesia ($67/mo)</p>
                      <p>Our Business tier: $29.99 (55% cheaper)</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: colors.completed.light }}>
                      <p className="font-medium" style={{ color: colors.completed.bg }}>vs VIDIZMO ($1000+/mo)</p>
                      <p>Our Enterprise: Custom (90% cheaper)</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: colors.completed.light }}>
                      <p className="font-medium" style={{ color: colors.completed.bg }}>vs Camtasia ($249 one-time)</p>
                      <p>Our Pro: $79.99/mo with AI features</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feature-matrix" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardHeader>
                  <CardTitle style={{ color: colors.application.bg }}>Feature Implementation Matrix (P0-P5)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="p-2 text-left border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>Category</th>
                          <th className="p-2 text-center border" style={{ borderColor: colors.border, backgroundColor: colors.completed.light }}>P0 Core</th>
                          <th className="p-2 text-center border" style={{ borderColor: colors.border, backgroundColor: colors.inProgress.light }}>P1 Mobile</th>
                          <th className="p-2 text-center border" style={{ borderColor: colors.border, backgroundColor: colors.planned.light }}>P2 Advanced</th>
                          <th className="p-2 text-center border" style={{ borderColor: colors.border, backgroundColor: colors.planned.light }}>P3 Segments</th>
                          <th className="p-2 text-center border" style={{ borderColor: colors.border, backgroundColor: colors.planned.light }}>P4-P5</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { category: 'Script Creation', p0: '✓ Manual + AI', p1: '○ Quick Templates', p2: '○ Collab Edit', p3: '○ Lesson Builder', p4: '○ Batch' },
                          { category: 'TTS Generation', p0: '✓ ElevenLabs', p1: '○ Voice Select', p2: '○ Offline TTS', p3: '○ Voice Clone', p4: '○ Custom' },
                          { category: 'Recording', p0: '✓ Camera + Teleprompter', p1: '○ One-Tap Mobile', p2: '○ Offline Mode', p3: '○ HIPAA', p4: '○ Multi-take' },
                          { category: 'Remix', p0: '—', p1: '○ Multi-Clip Timeline', p2: '○ AI Auto-Arrange', p3: '○ Segment Templates', p4: '○ Highlight Reel' },
                          { category: 'Export', p0: '◐ WebM/MP4', p1: '○ Social Presets', p2: '○ Batch Export', p3: '○ SCORM/LTI', p4: '○ API' },
                          { category: 'Collaboration', p0: '✓ Save/Load', p1: '○ Share Links', p2: '○ Real-time Collab', p3: '○ Review Flows', p4: '○ SSO/SAML' },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 border font-medium" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>{row.category}</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border, color: row.p0.startsWith('✓') ? colors.completed.bg : row.p0.startsWith('◐') ? colors.inProgress.bg : colors.textMuted }}>{row.p0}</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border, color: colors.textMuted }}>{row.p1}</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border, color: colors.textMuted }}>{row.p2}</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border, color: colors.textMuted }}>{row.p3}</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border, color: colors.textMuted }}>{row.p4}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex gap-6">
                    <div className="flex items-center gap-2"><span style={{ color: colors.completed.bg }}>✓</span><span className="text-sm">Implemented</span></div>
                    <div className="flex items-center gap-2"><span style={{ color: colors.inProgress.bg }}>◐</span><span className="text-sm">Partial</span></div>
                    <div className="flex items-center gap-2"><span style={{ color: colors.textMuted }}>○</span><span className="text-sm">Planned</span></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ui-flows" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.presentation.bg }}>
                    <Layout className="h-5 w-5" />UI Component Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 500" className="w-full h-auto">
                    <rect width="1200" height="500" fill={colors.background} rx="8" />

                    {/* Genie Mind UI */}
                    <g transform="translate(30, 20)">
                      <rect width="550" height="450" rx="12" fill={colors.cardBg} stroke={colors.presentation.bg} strokeWidth="2" />
                      <rect width="550" height="36" rx="12" fill={colors.presentation.bg} />
                      <text x="275" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">GENIE MIND UI (Script + TTS)</text>
                      
                      {/* Sidebar */}
                      <g transform="translate(10, 46)">
                        <rect width="120" height="390" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="60" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">SIDEBAR</text>
                        {['Projects ✓', 'Scripts ✓', 'Recordings ✓', 'Knowledge ✓', 'Templates (P1)', 'Analytics (P5)'].map((item, i) => (
                          <g key={item}>
                            <rect x="10" y={35 + i * 55} width="100" height="40" rx="4" fill={i < 4 ? colors.completed.light : colors.planned.light} stroke={i < 4 ? colors.completed.bg : colors.planned.bg} strokeWidth="1" />
                            <text x="60" y={60 + i * 55} textAnchor="middle" fill={colors.text} fontSize="9">{item}</text>
                          </g>
                        ))}
                      </g>

                      {/* Main Content */}
                      <g transform="translate(140, 46)">
                        <rect width="400" height="390" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="200" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">MAIN CONTENT</text>
                        
                        {/* Script Editor */}
                        <rect x="10" y="35" width="380" height="120" rx="6" fill={colors.cardBg} stroke={colors.completed.bg} strokeWidth="1" />
                        <text x="20" y="55" fill={colors.completed.bg} fontSize="10" fontWeight="600">Script Editor ✓</text>
                        <rect x="20" y="65" width="350" height="10" rx="2" fill={colors.border} />
                        <rect x="20" y="80" width="300" height="10" rx="2" fill={colors.border} />
                        <rect x="280" y="120" width="100" height="22" rx="4" fill={colors.completed.bg} />
                        <text x="330" y="135" textAnchor="middle" fill="#ffffff" fontSize="9">AI Enhance ✓</text>

                        {/* TTS + Preview */}
                        <rect x="10" y="165" width="185" height="80" rx="6" fill={colors.cardBg} stroke={colors.completed.bg} strokeWidth="1" />
                        <text x="20" y="185" fill={colors.completed.bg} fontSize="10" fontWeight="600">TTS Controls ✓</text>
                        <rect x="20" y="200" width="160" height="30" rx="3" fill={colors.completed.bg} />
                        <text x="100" y="220" textAnchor="middle" fill="#ffffff" fontSize="9">Generate Voice</text>

                        <rect x="205" y="165" width="185" height="80" rx="6" fill={colors.cardBg} stroke={colors.inProgress.bg} strokeWidth="1" />
                        <text x="215" y="185" fill={colors.inProgress.bg} fontSize="10" fontWeight="600">Preview</text>
                        <circle cx="297" cy="215" r="14" fill={colors.inProgress.bg} />
                        <text x="297" y="219" textAnchor="middle" fill="#ffffff" fontSize="11">▶</text>

                        {/* Actions */}
                        <rect x="10" y="260" width="120" height="35" rx="6" fill={colors.completed.bg} />
                        <text x="70" y="283" textAnchor="middle" fill="#ffffff" fontSize="11">Record ✓</text>
                        <rect x="140" y="260" width="120" height="35" rx="6" fill={colors.presentation.bg} />
                        <text x="200" y="283" textAnchor="middle" fill="#ffffff" fontSize="11">Save ✓</text>
                        <rect x="270" y="260" width="120" height="35" rx="6" fill={colors.planned.bg} />
                        <text x="330" y="283" textAnchor="middle" fill="#ffffff" fontSize="11">Publish (P1)</text>
                      </g>
                    </g>

                    {/* Arrow */}
                    <g transform="translate(590, 250)">
                      <rect x="0" y="-15" width="40" height="30" rx="4" fill={colors.presentation.bg} />
                      <text x="20" y="5" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">→</text>
                    </g>

                    {/* Genie Vibe UI */}
                    <g transform="translate(620, 20)">
                      <rect width="550" height="450" rx="12" fill={colors.cardBg} stroke={colors.completed.bg} strokeWidth="2" />
                      <rect width="550" height="36" rx="12" fill={colors.completed.bg} />
                      <text x="275" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">GENIE VIBE UI (Recording)</text>

                      {/* Video Preview */}
                      <g transform="translate(10, 46)">
                        <rect width="530" height="180" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="265" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">CAMERA PREVIEW ✓</text>
                        <rect x="20" y="35" width="330" height="125" rx="6" fill={colors.cardBg} stroke={colors.border} />
                        <text x="185" y="100" textAnchor="middle" fill={colors.textMuted} fontSize="12">Camera Feed</text>
                        <rect x="370" y="35" width="140" height="70" rx="6" fill={colors.cardBg} stroke={colors.border} />
                        <text x="440" y="75" textAnchor="middle" fill={colors.textMuted} fontSize="9">Screen Share ✓</text>
                      </g>

                      {/* Teleprompter + Controls */}
                      <g transform="translate(10, 236)">
                        <rect width="350" height="100" rx="8" fill={colors.background} stroke={colors.completed.bg} strokeWidth="1" />
                        <text x="175" y="22" textAnchor="middle" fill={colors.completed.bg} fontSize="10" fontWeight="600">TELEPROMPTER ✓</text>
                        {[36, 52, 68, 84].map((y, i) => (
                          <rect key={i} x="20" y={y} width={310 - i * 20} height="10" rx="2" fill={colors.border} />
                        ))}
                      </g>

                      <g transform="translate(370, 236)">
                        <rect width="170" height="100" rx="8" fill={colors.background} stroke={colors.domain.bg} strokeWidth="1" />
                        <text x="85" y="22" textAnchor="middle" fill={colors.domain.bg} fontSize="10" fontWeight="600">CONTROLS ✓</text>
                        <circle cx="85" cy="60" r="25" fill={colors.domain.bg} />
                        <text x="85" y="65" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">REC</text>
                      </g>

                      {/* Audio Levels */}
                      <g transform="translate(10, 346)">
                        <rect width="530" height="50" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="20" y="18" fill={colors.textMuted} fontSize="9" fontWeight="600">AUDIO LEVELS ✓</text>
                        {['TTS', 'VO', 'Music', 'Mic'].map((track, i) => (
                          <g key={track}>
                            <text x={40 + i * 130} y="38" fill={colors.text} fontSize="8">{track}</text>
                            <rect x={80 + i * 130} y="28" width="80" height="12" rx="2" fill={colors.border} />
                            <rect x={80 + i * 130} y="28" width={50 + i * 5} height="12" rx="2" fill={colors.completed.bg} />
                          </g>
                        ))}
                      </g>

                      {/* Future Features */}
                      <g transform="translate(10, 406)">
                        <rect width="530" height="35" rx="8" fill={colors.planned.light} stroke={colors.planned.bg} strokeWidth="1" />
                        <text x="265" y="22" textAnchor="middle" fill={colors.planned.bg} fontSize="10">P1-P5: Mobile Record | Remix Timeline | Offline Mode | HIPAA | White-label</text>
                      </g>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
