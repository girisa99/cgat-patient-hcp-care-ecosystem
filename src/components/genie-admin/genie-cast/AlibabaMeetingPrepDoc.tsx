/**
 * ALIBABA MEETING PREP DOCUMENT
 * Structured agenda + PDF download for Alibaba Cloud partnership meeting
 * Covers: CosyVoice v2, Wan 2.2 S2V Avatar, Full-body Digital Human, 3D Generation
 */

import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mic,
  Video,
  Box,
  Users,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// ============================================================================
// DATA
// ============================================================================

interface AgendaItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  priority: 'critical' | 'important' | 'nice-to-have';
  duration: string;
  items: {
    topic: string;
    currentStatus: string;
    question: string;
    expectedOutcome: string;
  }[];
}

const AGENDA_SECTIONS: AgendaItem[] = [
  {
    id: 'cosyvoice',
    title: 'CosyVoice v2 / Qwen3-TTS (Beijing)',
    icon: <Mic className="w-5 h-5" />,
    priority: 'critical',
    duration: '15 min',
    items: [
      {
        topic: 'CosyVoice v2 vs Qwen3-TTS-Flash',
        currentStatus: 'Using qwen3-tts-flash from Singapore. CosyVoice v2 (cosyvoice-v2) only available in Beijing.',
        question: 'Can CosyVoice v2 be enabled in Singapore? What are the voice quality differences between cosyvoice-v2 and qwen3-tts-flash?',
        expectedOutcome: 'Confirm if Singapore can run cosyvoice-v2 or if we must use Beijing endpoint.',
      },
      {
        topic: 'Emotion & Prosody Control',
        currentStatus: 'Azure provides viseme data for lip-sync. Qwen3-TTS does not.',
        question: 'Does CosyVoice v2 support: (a) SSML emotion tags? (b) Pitch/speed/emotion per-sentence? (c) Viseme/phoneme timing data for lip-sync?',
        expectedOutcome: 'If viseme data available → can replace Azure for CJK lip-sync (major differentiator).',
      },
      {
        topic: 'Multi-speaker TTS',
        currentStatus: 'Currently separate API calls per speaker.',
        question: 'Can CosyVoice v2 handle multi-speaker synthesis in a single API call? (dialogue-style videos)',
        expectedOutcome: 'Reduce API calls by 50% for interview/dialogue content.',
      },
      {
        topic: 'Voice Cloning / Custom Voices',
        currentStatus: 'Using preset voices (longyue, longfei, etc.)',
        question: 'Is voice cloning available? Can we train brand-specific voices? What are the requirements (audio samples, duration)?',
        expectedOutcome: 'Enable white-label brand voices for enterprise customers.',
      },
      {
        topic: 'Arabic Dialect Coverage',
        currentStatus: 'Azure covers 7 Arabic dialects. Unknown coverage for CosyVoice.',
        question: 'Does CosyVoice v2 support Gulf, Egyptian, Levantine, Maghrebi, MSA, Sudanese, Iraqi Arabic?',
        expectedOutcome: 'Match or exceed Azure dialect coverage for MENA zone.',
      },
      {
        topic: 'Streaming TTS',
        currentStatus: 'Batch-only TTS currently.',
        question: 'Does CosyVoice v2 support streaming audio output (WebSocket/SSE) for real-time preview during script editing?',
        expectedOutcome: 'Enable live narration preview in script editor.',
      },
    ],
  },
  {
    id: 'avatar',
    title: 'Wan 2.2 S2V Avatar (Speech-to-Video)',
    icon: <Video className="w-5 h-5" />,
    priority: 'critical',
    duration: '15 min',
    items: [
      {
        topic: 'Regional Availability',
        currentStatus: 'Wan 2.2 S2V is Beijing-only. Our edge functions run from US/EU (Supabase).',
        question: 'Can Wan 2.2 S2V be enabled in Singapore? If not, what is the cross-region latency for Singapore→Beijing API calls?',
        expectedOutcome: 'Either Singapore access or confirmed latency < 2s for cross-region.',
      },
      {
        topic: 'Custom Avatar Training',
        currentStatus: 'Using generic preset avatars.',
        question: 'Can we fine-tune S2V with client brand ambassador photos? What is the training pipeline? Cost per avatar? Turnaround time?',
        expectedOutcome: 'Enable brand-specific avatars — key differentiator vs competitors.',
      },
      {
        topic: 'Lip-sync Accuracy',
        currentStatus: 'Need viseme-accurate lip-sync across CJK + Arabic.',
        question: 'What is the lip-sync accuracy for: (a) Chinese (Mandarin/Cantonese)? (b) Japanese? (c) Korean? (d) Arabic? Does it use phoneme-level alignment?',
        expectedOutcome: 'Confirm production-grade lip-sync for all CJK languages.',
      },
      {
        topic: 'Video Quality & Duration',
        currentStatus: 'Unknown max duration and resolution options.',
        question: 'Max video duration per generation? Resolution options (720p/1080p/4K)? Can we chain clips for long-form content?',
        expectedOutcome: 'Confirm suitability for 30-60s marketing videos.',
      },
      {
        topic: 'Background/Scene Control',
        currentStatus: 'No background customization known.',
        question: 'Can we control the background scene? Green screen output? Custom background injection? Product placement behind avatar?',
        expectedOutcome: 'Enable branded backgrounds for enterprise videos.',
      },
    ],
  },
  {
    id: 'fullbody',
    title: 'Full-body Avatar / Digital Human',
    icon: <Users className="w-5 h-5" />,
    priority: 'important',
    duration: '10 min',
    items: [
      {
        topic: 'Full-body Digital Human Service',
        currentStatus: 'No full-body avatar integration. Only talking head (S2V).',
        question: 'Does Alibaba offer full-body digital human services? (e.g., standing presenter, walking, gesturing) What models/APIs are available?',
        expectedOutcome: 'Identify full-body avatar service for product demos and presentations.',
      },
      {
        topic: 'Gesture & Motion Control',
        currentStatus: 'N/A — exploring new capability.',
        question: 'Can gestures be scripted? (pointing, waving, demonstrating) Is there a gesture library or API for controlling body language?',
        expectedOutcome: 'Enable scripted presenter movements for educational/demo content.',
      },
      {
        topic: 'Multi-avatar Scenes',
        currentStatus: 'Single avatar only.',
        question: 'Can multiple digital humans appear in the same scene? (e.g., interview format, panel discussion)',
        expectedOutcome: 'Enable dialogue/interview video formats with multiple avatars.',
      },
      {
        topic: 'Real-time vs Pre-rendered',
        currentStatus: 'Pre-rendered video generation.',
        question: 'Is real-time digital human rendering available for live interactions? Or is it batch-only?',
        expectedOutcome: 'Understand if live avatar interaction is possible for future roadmap.',
      },
    ],
  },
  {
    id: '3d',
    title: '3D Model Generation',
    icon: <Box className="w-5 h-5" />,
    priority: 'important',
    duration: '10 min',
    items: [
      {
        topic: 'Alibaba 3D Generation Services',
        currentStatus: 'Using Meshy AI as primary 3D provider.',
        question: 'Does Alibaba offer text-to-3D or image-to-3D generation? Model name? API availability? Singapore endpoint?',
        expectedOutcome: 'Evaluate if Alibaba 3D can complement or replace Meshy AI.',
      },
      {
        topic: 'Product 3D Model Generation',
        currentStatus: 'Meshy generates generic 3D models.',
        question: 'Can Alibaba generate product-accurate 3D models from product photos? (e.g., scan a shoe → 3D model) Quality comparison vs Meshy?',
        expectedOutcome: 'Product-grade 3D models for e-commerce marketing videos.',
      },
      {
        topic: '3D-to-Video Pipeline',
        currentStatus: 'Separate 3D generation + video composition.',
        question: 'Is there an integrated 3D-to-video pipeline? (generate 3D model → animate → render to video in one API call)',
        expectedOutcome: 'Simplify pipeline from 3 API calls to 1.',
      },
      {
        topic: 'AR/VR Export Formats',
        currentStatus: 'Standard mesh output from Meshy.',
        question: 'What export formats are supported? (GLB, USDZ, FBX) AR-ready output? WebXR compatible?',
        expectedOutcome: 'Confirm format compatibility for web-based 3D viewers.',
      },
    ],
  },
  {
    id: 'beijing',
    title: 'Beijing Region Activation & Access',
    icon: <Globe className="w-5 h-5" />,
    priority: 'critical',
    duration: '10 min',
    items: [
      {
        topic: 'ALIBABA_CHINA_API_KEY Status',
        currentStatus: 'Key stored but unclear if billing-enabled and all services activated.',
        question: 'Is our Beijing API key active with pay-as-you-go billing? Which models are currently authorized for this key?',
        expectedOutcome: 'Confirm billing status and authorized model list.',
      },
      {
        topic: 'Batch Operation Activation',
        currentStatus: 'Async models (T2I, T2V, S2V, STT) require manual Batch Operation activation.',
        question: 'Which Beijing models need Batch Operation activation? Can you help us activate them during this meeting?',
        expectedOutcome: 'All async services activated and ready for production.',
      },
      {
        topic: 'Cross-region API Calls',
        currentStatus: 'Edge functions run from US/EU, calling Beijing endpoints.',
        question: 'Any firewall restrictions for international→Beijing calls? IP whitelisting needed? Is there a managed gateway/proxy for cross-region?',
        expectedOutcome: 'Confirm reliable cross-region connectivity.',
      },
      {
        topic: 'Data Residency & Compliance',
        currentStatus: 'Generating content via Beijing for international users.',
        question: 'Does generated content (videos, audio) stay in China? GDPR implications for EU users? Can we specify output storage region?',
        expectedOutcome: 'Clear compliance guidance for international deployments.',
      },
      {
        topic: 'API Key Consolidation',
        currentStatus: '3 keys: ALIBABA_API_KEY (Virginia), ALIBABA_SINGAPORE_API_KEY, ALIBABA_CHINA_API_KEY.',
        question: 'Can we consolidate to 2 keys (Singapore + Beijing)? Is the Virginia key still needed?',
        expectedOutcome: 'Simplify key management.',
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial & Partnership',
    icon: <DollarSign className="w-5 h-5" />,
    priority: 'nice-to-have',
    duration: '10 min',
    items: [
      {
        topic: 'Volume Pricing',
        currentStatus: 'Standard pay-as-you-go pricing.',
        question: 'At 10K+ video generations/month, 1M+ TTS characters/day — what volume pricing tiers are available?',
        expectedOutcome: 'Get pricing proposal for enterprise scale.',
      },
      {
        topic: 'Startup/Partner Program',
        currentStatus: 'No formal partnership.',
        question: 'Are there credits, co-marketing, or technical partnership programs for SaaS platforms building on Alibaba Cloud AI?',
        expectedOutcome: 'Explore partnership benefits.',
      },
      {
        topic: 'Dedicated Support Channel',
        currentStatus: 'Standard support only.',
        question: 'Can we get a dedicated technical escalation path? Slack/DingTalk channel for production issues?',
        expectedOutcome: 'Establish direct communication for production issues.',
      },
      {
        topic: 'Roadmap Preview',
        currentStatus: 'No visibility into upcoming models.',
        question: 'What new models/services are planned for Q3/Q4 2026? Any improvements to Wan/CosyVoice/Qwen?',
        expectedOutcome: 'Align our roadmap with Alibaba releases.',
      },
    ],
  },
];

const DEMO_CHECKLIST = [
  '4-Zone AI Routing — show Qwen-Max auto-selected for CJK/MENA',
  'TTS Provider Selector — toggle between Qwen3-TTS and Azure Neural',
  '434 Template Library — show multimodal templates mapped to providers',
  '7 Arabic Dialect Support — unique differentiator',
  'Blueprint → Script → Video pipeline — end-to-end "Mind to Media"',
  'Landing Page with regional scripts — show transcreation quality',
];

const KEY_TALKING_POINTS = [
  'We route AI providers by regional zone — Alibaba for CJK/MENA, Azure for Western, Gemini for India/SEA. Native-quality output, not translated.',
  '7 Arabic dialects with lip-sync — no competitor offers this breadth.',
  '14+ simultaneous language production with batch processing.',
  'Zero-hardcoding architecture — adding new Alibaba models is config-only.',
  '434+ templates across 21 industries with multimodal flags.',
  '19 integrated AI providers with automated fallback chains.',
];

// ============================================================================
// PDF GENERATOR
// ============================================================================

function generateMeetingPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 20;
  const maxY = pageHeight - bottomMargin;
  let y = 25;

  // Smart page break: checks if content fits, adds new page if not
  const ensureSpace = (needed: number) => {
    if (y + needed > maxY) {
      pdf.addPage();
      y = 25;
      // Add page header line
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, 18, pageWidth - margin, 18);
      y = 25;
    }
  };

  // Helper: draw wrapped text and return actual height used
  const drawWrappedText = (text: string, x: number, currentY: number, maxWidth: number, fontSize: number, lineHeight: number): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const totalHeight = lines.length * lineHeight;
    
    // Check if this block fits on current page
    if (currentY + totalHeight > maxY) {
      pdf.addPage();
      y = 25;
      currentY = 25;
    }
    
    lines.forEach((line: string, idx: number) => {
      pdf.text(line, x, currentY + (idx * lineHeight));
    });
    
    return totalHeight;
  };

  // ── TITLE PAGE ──
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('Alibaba Cloud', margin, y);
  y += 10;
  pdf.text('Partnership Meeting', margin, y);
  y += 14;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text('Genie Suite  |  Mind to Media Platform', margin, y);
  y += 7;
  pdf.text(`Prepared: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
  y += 7;
  pdf.text('Estimated Duration: ~70 minutes', margin, y);
  y += 7;
  pdf.text('Sections: 6  |  Topics: 27', margin, y);
  y += 12;

  // Divider
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── TABLE OF CONTENTS ──
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const priorityMarker = (p: string) => p === 'critical' ? '[CRITICAL]' : p === 'important' ? '[IMPORTANT]' : '[NICE-TO-HAVE]';
  AGENDA_SECTIONS.forEach((section, idx) => {
    pdf.setTextColor(60, 60, 60);
    pdf.text(`${idx + 1}. ${section.title}  —  ${priorityMarker(section.priority)}  (${section.duration})`, margin + 2, y);
    y += 6;
  });
  y += 4;
  pdf.text('7. Live Demo Checklist', margin + 2, y); y += 6;
  pdf.text('8. Key Talking Points', margin + 2, y); y += 6;
  pdf.text('9. Post-Meeting Action Items', margin + 2, y); y += 10;

  // ── AGENDA SECTIONS ──
  AGENDA_SECTIONS.forEach((section, sectionIdx) => {
    // Always start each major section on a new page for clarity
    pdf.addPage();
    y = 25;

    // Section header with colored bar
    const barColors: Record<string, [number, number, number]> = {
      critical: [220, 50, 50],
      important: [210, 160, 30],
      'nice-to-have': [40, 160, 80],
    };
    const barColor = barColors[section.priority] || [100, 100, 100];
    pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
    pdf.rect(margin, y - 5, 3, 10, 'F');

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(`${sectionIdx + 1}. ${section.title}`, margin + 6, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Priority: ${priorityMarker(section.priority)}  |  Duration: ${section.duration}  |  Topics: ${section.items.length}`, margin + 6, y);
    y += 10;

    // Items
    section.items.forEach((item, itemIdx) => {
      // Estimate total height for this item (topic + 3 text blocks)
      const estimatedHeight = 45;
      ensureSpace(estimatedHeight);

      // Topic header
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      pdf.text(`${sectionIdx + 1}.${itemIdx + 1}  ${item.topic}`, margin + 2, y);
      y += 7;

      // Status
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(90, 90, 90);
      const statusText = `Current Status: ${item.currentStatus}`;
      const statusLines = pdf.splitTextToSize(statusText, contentWidth - 12);
      const statusHeight = statusLines.length * 4.5;
      ensureSpace(statusHeight + 2);
      pdf.text(statusLines, margin + 8, y);
      y += statusHeight + 3;

      // Question (blue)
      pdf.setTextColor(20, 60, 160);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const askText = `Ask: ${item.question}`;
      const askLines = pdf.splitTextToSize(askText, contentWidth - 12);
      const askHeight = askLines.length * 4.5;
      ensureSpace(askHeight + 2);
      pdf.text(askLines, margin + 8, y);
      y += askHeight + 3;

      // Expected outcome (green)
      pdf.setTextColor(20, 130, 50);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const expectedText = `Expected Outcome: ${item.expectedOutcome}`;
      const expectedLines = pdf.splitTextToSize(expectedText, contentWidth - 12);
      const expectedHeight = expectedLines.length * 4.5;
      ensureSpace(expectedHeight + 2);
      pdf.text(expectedLines, margin + 8, y);
      y += expectedHeight + 5;

      // Light separator between items
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.line(margin + 8, y, pageWidth - margin, y);
      y += 5;
      pdf.setTextColor(0, 0, 0);
    });
  });

  // ── DEMO CHECKLIST ──
  pdf.addPage();
  y = 25;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('7. Live Demo Checklist', margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  DEMO_CHECKLIST.forEach((item) => {
    ensureSpace(10);
    // Checkbox
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.3);
    pdf.rect(margin + 2, y - 3, 4, 4);
    // Text
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(item, contentWidth - 12);
    pdf.text(lines, margin + 10, y);
    y += lines.length * 5 + 3;
  });

  // ── KEY TALKING POINTS ──
  y += 8;
  ensureSpace(20);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('8. Key Talking Points', margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  KEY_TALKING_POINTS.forEach((point, idx) => {
    ensureSpace(16);
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(`${idx + 1}. ${point}`, contentWidth - 8);
    pdf.text(lines, margin + 4, y);
    y += lines.length * 5 + 4;
  });

  // ── POST-MEETING ACTION ITEMS ──
  pdf.addPage();
  y = 25;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('9. Post-Meeting Action Items', margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const actions = [
    ['Enable CosyVoice v2 in Singapore (or confirm Beijing-only)', 'Alibaba'],
    ['Activate Batch Operations for async models (Beijing)', 'Alibaba'],
    ['Test viseme data from CosyVoice v2', 'Engineering'],
    ['Full-body digital human API access', 'Alibaba'],
    ['3D generation service evaluation', 'Both'],
    ['Volume pricing proposal', 'Alibaba'],
    ['Transition free quota to production billing', 'Engineering'],
    ['API key consolidation (3 to 2 keys)', 'Both'],
  ];

  // Table header
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y - 4, contentWidth, 8, 'F');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Action Item', margin + 4, y);
  pdf.text('Owner', margin + contentWidth - 30, y);
  pdf.text('Done', margin + contentWidth - 8, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  actions.forEach(([action, owner]) => {
    ensureSpace(10);
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(action, contentWidth - 50);
    pdf.text(lines, margin + 4, y);
    pdf.setTextColor(100, 100, 100);
    pdf.text(owner, margin + contentWidth - 30, y);
    // Checkbox
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.3);
    pdf.rect(margin + contentWidth - 6, y - 3, 4, 4);
    y += lines.length * 5 + 4;
    // Light line
    pdf.setDrawColor(235, 235, 235);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  // ── NOTES PAGE ──
  pdf.addPage();
  y = 25;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('Meeting Notes', margin, y);
  y += 10;

  // Ruled lines for notes
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  for (let i = 0; i < 25; i++) {
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;
  }

  // ── PAGE NUMBERS ──
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(160, 160, 160);
    pdf.text(`Genie Suite — Alibaba Meeting Prep  |  Page ${i} of ${totalPages}`, margin, pageHeight - 10);
  }

  pdf.save('Alibaba_Meeting_Prep_Genie_Suite.pdf');
}

// ============================================================================
// COMPONENT
// ============================================================================

const priorityColors: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  important: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  'nice-to-have': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
};

const priorityLabels: Record<string, string> = {
  critical: 'Critical',
  important: 'Important',
  'nice-to-have': 'Nice to Have',
};

export const AlibabaMeetingPrepDoc: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['cosyvoice']));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCheck = useCallback((key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleDownloadPDF = useCallback(() => {
    try {
      generateMeetingPDF();
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('[MeetingPrep] PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    }
  }, []);

  const totalTopics = AGENDA_SECTIONS.reduce((t, s) => t + s.items.length, 0);
  const totalDuration = AGENDA_SECTIONS.reduce((t, s) => t + parseInt(s.duration), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Alibaba Cloud Partnership Meeting
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {AGENDA_SECTIONS.length} sections · {totalTopics} topics · ~{totalDuration} min
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        {AGENDA_SECTIONS.map((s) => (
          <Badge key={s.id} variant="outline" className={`${priorityColors[s.priority]} text-xs`}>
            {s.title.split(' ')[0]} — {priorityLabels[s.priority]}
          </Badge>
        ))}
      </div>

      <Separator />

      {/* Agenda Sections */}
      <ScrollArea className="h-[calc(100vh-18rem)]">
        <div className="space-y-3 pr-3">
          {AGENDA_SECTIONS.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <Card className="border border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{section.icon}</div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {section.items.length} topics · {section.duration}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${priorityColors[section.priority]} text-[10px]`}>
                          {priorityLabels[section.priority]}
                        </Badge>
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-3 space-y-3">
                    {section.items.map((item, idx) => {
                      const key = `${section.id}-${idx}`;
                      const checked = checkedItems.has(key);
                      return (
                        <div
                          key={key}
                          className={`border rounded-lg p-3 space-y-2 transition-colors ${
                            checked ? 'bg-muted/40 border-primary/20' : 'border-border/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleCheck(key)}
                              className="mt-0.5 shrink-0"
                            >
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  checked ? 'text-primary fill-primary/20' : 'text-muted-foreground/40'
                                }`}
                              />
                            </button>
                            <span className={`text-sm font-medium ${checked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.topic}
                            </span>
                          </div>

                          <div className="ml-6 space-y-1.5">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">Status:</span> {item.currentStatus}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              <span className="font-medium">Ask:</span> {item.question}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              <span className="font-medium">Expected:</span> {item.expectedOutcome}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {/* Demo Checklist */}
          <Card className="border border-border/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Live Demo Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-3 space-y-2">
              {DEMO_CHECKLIST.map((item, idx) => {
                const key = `demo-${idx}`;
                const checked = checkedItems.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleCheck(key)}
                    className={`flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted/40 transition-colors ${
                      checked ? 'bg-muted/30' : ''
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        checked ? 'text-primary fill-primary/20' : 'text-muted-foreground/40'
                      }`}
                    />
                    <span className={`text-xs ${checked ? 'line-through text-muted-foreground' : ''}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Key Talking Points */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                Key Talking Points
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-3">
              <ul className="space-y-2">
                {KEY_TALKING_POINTS.map((point, idx) => (
                  <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlibabaMeetingPrepDoc;
