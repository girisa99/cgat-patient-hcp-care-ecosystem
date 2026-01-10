import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, X, FileImage, FileCode, Video } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const GenieRecordingStudioArchitectureDiagram = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('genie-recording-architecture-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'genie-recording-studio-architecture.svg';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded successfully!');
    }
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'genie-recording-studio-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const DiagramContent = () => (
    <svg
      id="genie-recording-architecture-svg"
      viewBox="0 0 1600 1100"
      className="w-full h-auto"
      style={{ minHeight: '800px' }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="genieStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="recordingStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="dataFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="mediaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="mobileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="remixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
        <marker id="arrowheadBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>

      {/* Background */}
      <rect width="1600" height="1100" fill="#0f172a" />

      {/* Title */}
      <text x="800" y="45" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">
        Genie Mind ↔ Genie Vibe Architecture (110 Scenarios)
      </text>
      <text x="800" y="75" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif">
        "From Mind to Media" — End-to-End Content Production Pipeline • Mobile-First • 6 Market Segments
      </text>

      {/* Stats Bar */}
      <g transform="translate(400, 90)">
        <rect x="0" y="0" width="800" height="35" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="50" y="23" fill="#10b981" fontSize="12" fontWeight="bold">✓ 8 Implemented</text>
        <text x="200" y="23" fill="#f59e0b" fontSize="12" fontWeight="bold">◐ 6 Partial</text>
        <text x="350" y="23" fill="#6366f1" fontSize="12" fontWeight="bold">○ 96 Planned</text>
        <text x="500" y="23" fill="#94a3b8" fontSize="12">68% want mobile-first</text>
        <text x="680" y="23" fill="#94a3b8" fontSize="12">54% need offline</text>
      </g>

      {/* GENIE STUDIO SECTION */}
      <g transform="translate(50, 140)">
        {/* Main Container */}
        <rect x="0" y="0" width="680" height="580" rx="16" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="3" filter="url(#dropShadow)" />
        
        {/* Header */}
        <rect x="0" y="0" width="680" height="60" rx="16" fill="url(#genieStudioGrad)" />
        <text x="340" y="35" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold">🧞 Genie Mind</text>
        <text x="340" y="52" textAnchor="middle" fill="#e0e7ff" fontSize="10">AI That Understands — Pre-Production Command Center</text>

        {/* Project Management */}
        <g transform="translate(20, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="bold">📁 Projects</text>
          <text x="100" y="42" textAnchor="middle" fill="#e0e7ff" fontSize="10">Create & Manage</text>
          <text x="100" y="58" textAnchor="middle" fill="#e0e7ff" fontSize="10">Production Projects</text>
          <rect x="20" y="72" width="160" height="28" rx="6" fill="#4338ca" />
          <text x="100" y="90" textAnchor="middle" fill="#ffffff" fontSize="9">Patient Onboarding v2</text>
        </g>

        {/* Script Management */}
        <g transform="translate(240, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="bold">📝 Scripts</text>
          <text x="100" y="42" textAnchor="middle" fill="#e0e7ff" fontSize="10">Write, Edit, Enhance</text>
          <text x="100" y="58" textAnchor="middle" fill="#e0e7ff" fontSize="10">with AI Assistance</text>
          <rect x="10" y="72" width="85" height="26" rx="6" fill="#059669" />
          <text x="52" y="89" textAnchor="middle" fill="#ffffff" fontSize="9">Original</text>
          <rect x="105" y="72" width="85" height="26" rx="6" fill="#7c3aed" />
          <text x="147" y="89" textAnchor="middle" fill="#ffffff" fontSize="9">AI Enhanced</text>
        </g>

        {/* TTS Generation */}
        <g transform="translate(460, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="bold">🔊 TTS Engine</text>
          <text x="100" y="42" textAnchor="middle" fill="#e0e7ff" fontSize="10">Text-to-Speech</text>
          <text x="100" y="58" textAnchor="middle" fill="#e0e7ff" fontSize="10">Multi-Provider</text>
          <rect x="15" y="72" width="80" height="26" rx="6" fill="#ec4899" />
          <text x="55" y="89" textAnchor="middle" fill="#ffffff" fontSize="9">ElevenLabs</text>
          <rect x="105" y="72" width="80" height="26" rx="6" fill="#8b5cf6" />
          <text x="145" y="89" textAnchor="middle" fill="#ffffff" fontSize="9">OpenAI</text>
        </g>

        {/* Bidirectional Flow - NEW */}
        <g transform="translate(20, 210)">
          <rect x="0" y="0" width="640" height="80" rx="10" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
          <text x="320" y="22" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">✅ Bidirectional Vibe ↔ Mind Flow (Implemented)</text>
          <text x="160" y="48" textAnchor="middle" fill="#ccfbf1" fontSize="10">Flow 1: Mind → Script → TTS → Vibe → Publish</text>
          <text x="480" y="48" textAnchor="middle" fill="#ccfbf1" fontSize="10">Flow 2: Vibe → ContentAnalyzer → Mind → Script</text>
          <text x="320" y="68" textAnchor="middle" fill="#5eead4" fontSize="9">ContentAnalyzer.tsx • VibeToMindBridge.tsx • ScriptVersioning</text>
        </g>

        {/* Knowledge Base */}
        <g transform="translate(20, 305)">
          <rect x="0" y="0" width="310" height="110" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="22" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">📚 Knowledge Base (RAG)</text>
          
          <rect x="15" y="40" width="85" height="50" rx="6" fill="#0d9488" />
          <text x="57" y="60" textAnchor="middle" fill="#fff" fontSize="9">Documents</text>
          <text x="57" y="78" textAnchor="middle" fill="#ccfbf1" fontSize="8">PDF, MD, TXT</text>
          
          <rect x="110" y="40" width="85" height="50" rx="6" fill="#0284c7" />
          <text x="152" y="60" textAnchor="middle" fill="#fff" fontSize="9">Media</text>
          <text x="152" y="78" textAnchor="middle" fill="#e0f2fe" fontSize="8">PPT, Images</text>
          
          <rect x="205" y="40" width="90" height="50" rx="6" fill="#9333ea" />
          <text x="250" y="60" textAnchor="middle" fill="#fff" fontSize="9">Embeddings</text>
          <text x="250" y="78" textAnchor="middle" fill="#f3e8ff" fontSize="8">Vector Search</text>
        </g>

        {/* Mobile-First Features - NEW */}
        <g transform="translate(350, 305)">
          <rect x="0" y="0" width="310" height="110" rx="10" fill="#7c2d12" stroke="#f97316" strokeWidth="2" />
          <text x="155" y="22" textAnchor="middle" fill="#fdba74" fontSize="13" fontWeight="bold">📱 Mobile-First (Phase 3-4)</text>
          
          <rect x="15" y="40" width="85" height="50" rx="6" fill="#ea580c" />
          <text x="57" y="60" textAnchor="middle" fill="#fff" fontSize="9">One-Tap</text>
          <text x="57" y="78" textAnchor="middle" fill="#fed7aa" fontSize="8">68% want this</text>
          
          <rect x="110" y="40" width="85" height="50" rx="6" fill="#d97706" />
          <text x="152" y="60" textAnchor="middle" fill="#fff" fontSize="9">Offline</text>
          <text x="152" y="78" textAnchor="middle" fill="#fef3c7" fontSize="8">54% need this</text>
          
          <rect x="205" y="40" width="90" height="50" rx="6" fill="#b45309" />
          <text x="250" y="60" textAnchor="middle" fill="#fff" fontSize="9">Voice-First</text>
          <text x="250" y="78" textAnchor="middle" fill="#fef3c7" fontSize="8">47% want this</text>
        </g>

        {/* Production Context Builder */}
        <g transform="translate(20, 430)">
          <rect x="0" y="0" width="640" height="130" rx="12" fill="url(#mobileGrad)" filter="url(#dropShadow)" />
          <text x="320" y="28" textAnchor="middle" fill="#1e293b" fontSize="15" fontWeight="bold">📦 Production Context Builder</text>
          <text x="320" y="46" textAnchor="middle" fill="#422006" fontSize="11">Bundles all assets for Genie Vibe handoff</text>
          
          <rect x="15" y="58" width="145" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="87" y="80" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">Scripts + Timings</text>
          <text x="87" y="98" textAnchor="middle" fill="#92400e" fontSize="8">With cue points</text>
          
          <rect x="170" y="58" width="145" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="242" y="80" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">TTS Audio Files</text>
          <text x="242" y="98" textAnchor="middle" fill="#92400e" fontSize="8">Generated voiceovers</text>
          
          <rect x="325" y="58" width="145" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="397" y="80" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">Project Metadata</text>
          <text x="397" y="98" textAnchor="middle" fill="#92400e" fontSize="8">Config & settings</text>
          
          <rect x="480" y="58" width="145" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="552" y="80" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">Music Tracks</text>
          <text x="552" y="98" textAnchor="middle" fill="#92400e" fontSize="8">Background audio</text>
        </g>
      </g>

      {/* DATA FLOW ARROW */}
      <g transform="translate(730, 400)">
        <rect x="0" y="0" width="140" height="80" rx="40" fill="url(#dataFlowGrad)" filter="url(#dropShadow)" />
        <text x="70" y="32" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">→</text>
        <text x="70" y="52" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Context</text>
        <text x="70" y="68" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Handoff</text>
      </g>

      {/* RECORDING STUDIO SECTION */}
      <g transform="translate(870, 140)">
        {/* Main Container */}
        <rect x="0" y="0" width="680" height="580" rx="16" fill="#042f2e" stroke="#059669" strokeWidth="3" filter="url(#dropShadow)" />
        
        {/* Header */}
        <rect x="0" y="0" width="680" height="60" rx="16" fill="url(#recordingStudioGrad)" />
        <text x="340" y="35" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold">🎬 Genie Vibe</text>
        <text x="340" y="52" textAnchor="middle" fill="#d1fae5" fontSize="10">Script to Screen — Professional Recording Environment</text>

        {/* Teleprompter */}
        <g transform="translate(20, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#5eead4" fontSize="13" fontWeight="bold">📜 Teleprompter</text>
          <text x="100" y="42" textAnchor="middle" fill="#ccfbf1" fontSize="10">Synced Script Display</text>
          <text x="100" y="58" textAnchor="middle" fill="#ccfbf1" fontSize="10">Separate Window</text>
          <rect x="20" y="72" width="160" height="28" rx="6" fill="#0f766e" />
          <text x="100" y="90" textAnchor="middle" fill="#99f6e4" fontSize="9">↕ Draggable • Speed Control</text>
        </g>

        {/* Video Preview */}
        <g transform="translate(240, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#5eead4" fontSize="13" fontWeight="bold">📹 Video Preview</text>
          <text x="100" y="42" textAnchor="middle" fill="#ccfbf1" fontSize="10">Live Camera Feed</text>
          <text x="100" y="58" textAnchor="middle" fill="#ccfbf1" fontSize="10">+ Screen Capture</text>
          <rect x="10" y="72" width="55" height="28" rx="6" fill="#0891b2" />
          <text x="37" y="90" textAnchor="middle" fill="#fff" fontSize="8">Camera</text>
          <rect x="72" y="72" width="55" height="28" rx="6" fill="#7c3aed" />
          <text x="100" y="90" textAnchor="middle" fill="#fff" fontSize="8">Screen</text>
          <rect x="135" y="72" width="55" height="28" rx="6" fill="#059669" />
          <text x="162" y="90" textAnchor="middle" fill="#fff" fontSize="8">PiP</text>
        </g>

        {/* Audio Mixer */}
        <g transform="translate(460, 75)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="22" textAnchor="middle" fill="#5eead4" fontSize="13" fontWeight="bold">🎚️ Audio Mixer</text>
          <text x="100" y="42" textAnchor="middle" fill="#ccfbf1" fontSize="10">Floating Panel</text>
          <text x="100" y="58" textAnchor="middle" fill="#ccfbf1" fontSize="10">Multi-track Control</text>
          
          {/* Volume bars */}
          <rect x="30" y="72" width="12" height="30" rx="2" fill="#374151" />
          <rect x="30" y="88" width="12" height="14" rx="2" fill="#22c55e" />
          <text x="36" y="112" textAnchor="middle" fill="#9ca3af" fontSize="7">TTS</text>
          
          <rect x="60" y="72" width="12" height="30" rx="2" fill="#374151" />
          <rect x="60" y="82" width="12" height="20" rx="2" fill="#3b82f6" />
          <text x="66" y="112" textAnchor="middle" fill="#9ca3af" fontSize="7">VO</text>
          
          <rect x="90" y="72" width="12" height="30" rx="2" fill="#374151" />
          <rect x="90" y="92" width="12" height="10" rx="2" fill="#ec4899" />
          <text x="96" y="112" textAnchor="middle" fill="#9ca3af" fontSize="7">Music</text>
          
          <rect x="120" y="72" width="12" height="30" rx="2" fill="#374151" />
          <rect x="120" y="78" width="12" height="24" rx="2" fill="#f59e0b" />
          <text x="126" y="112" textAnchor="middle" fill="#9ca3af" fontSize="7">Mic</text>
          
          <text x="160" y="88" textAnchor="middle" fill="#5eead4" fontSize="8">Ducking</text>
          <text x="160" y="102" textAnchor="middle" fill="#14b8a6" fontSize="10">ON</text>
        </g>

        {/* Remix & Clips - NEW */}
        <g transform="translate(20, 210)">
          <rect x="0" y="0" width="640" height="80" rx="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <text x="320" y="22" textAnchor="middle" fill="#22d3ee" fontSize="13" fontWeight="bold">🎬 Remix & Clip Assembly (Phase 4-5)</text>
          <text x="110" y="48" textAnchor="middle" fill="#a5f3fc" fontSize="10">Multi-Clip Timeline</text>
          <text x="260" y="48" textAnchor="middle" fill="#a5f3fc" fontSize="10">AI Auto-Arrange</text>
          <text x="410" y="48" textAnchor="middle" fill="#a5f3fc" fontSize="10">Smart Transitions</text>
          <text x="560" y="48" textAnchor="middle" fill="#a5f3fc" fontSize="10">Music Sync</text>
          <text x="320" y="68" textAnchor="middle" fill="#67e8f9" fontSize="9">82% of creators want quick clips generator</text>
        </g>

        {/* Recording Controls */}
        <g transform="translate(20, 305)">
          <rect x="0" y="0" width="310" height="110" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="22" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">🎛️ Recording Controls</text>
          
          <circle cx="50" cy="70" r="22" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
          <text x="50" y="75" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">REC</text>
          
          <circle cx="110" cy="70" r="18" fill="#0ea5e9" />
          <text x="110" y="74" textAnchor="middle" fill="#fff" fontSize="16">⏸</text>
          
          <circle cx="165" cy="70" r="18" fill="#6366f1" />
          <text x="165" y="74" textAnchor="middle" fill="#fff" fontSize="16">⏹</text>
          
          <rect x="200" y="52" width="95" height="38" rx="6" fill="#059669" />
          <text x="247" y="68" textAnchor="middle" fill="#fff" fontSize="8">Countdown</text>
          <text x="247" y="82" textAnchor="middle" fill="#bbf7d0" fontSize="11" fontWeight="bold">3s</text>
        </g>

        {/* Export & Segment Features */}
        <g transform="translate(350, 305)">
          <rect x="0" y="0" width="310" height="110" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="22" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">💾 Export + Segments</text>
          
          <rect x="15" y="40" width="85" height="50" rx="6" fill="#059669" />
          <text x="57" y="60" textAnchor="middle" fill="#fff" fontSize="9">MP4/WebM</text>
          <text x="57" y="78" textAnchor="middle" fill="#bbf7d0" fontSize="8">Standard</text>
          
          <rect x="110" y="40" width="85" height="50" rx="6" fill="#ec4899" />
          <text x="152" y="60" textAnchor="middle" fill="#fff" fontSize="9">Healthcare</text>
          <text x="152" y="78" textAnchor="middle" fill="#fbcfe8" fontSize="8">HIPAA (P4)</text>
          
          <rect x="205" y="40" width="90" height="50" rx="6" fill="#f59e0b" />
          <text x="250" y="60" textAnchor="middle" fill="#fff" fontSize="9">Social</text>
          <text x="250" y="78" textAnchor="middle" fill="#fef3c7" fontSize="8">TikTok/Reels</text>
        </g>

        {/* Segment Quick Actions */}
        <g transform="translate(20, 430)">
          <rect x="0" y="0" width="640" height="130" rx="12" fill="url(#remixGrad)" filter="url(#dropShadow)" />
          <text x="320" y="28" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="bold">🎯 Segment-Specific Features (Phase 4-5)</text>
          
          <rect x="15" y="48" width="115" height="65" rx="8" fill="#042f2e" stroke="#10b981" strokeWidth="1" />
          <text x="72" y="68" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">SMB</text>
          <text x="72" y="84" textAnchor="middle" fill="#ccfbf1" fontSize="8">Product Demo</text>
          <text x="72" y="100" textAnchor="middle" fill="#5eead4" fontSize="7">71% want this</text>
          
          <rect x="140" y="48" width="115" height="65" rx="8" fill="#042f2e" stroke="#3b82f6" strokeWidth="1" />
          <text x="197" y="68" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">Education</text>
          <text x="197" y="84" textAnchor="middle" fill="#bfdbfe" fontSize="8">Lesson Builder</text>
          <text x="197" y="100" textAnchor="middle" fill="#60a5fa" fontSize="7">69% want AI scripts</text>
          
          <rect x="265" y="48" width="115" height="65" rx="8" fill="#042f2e" stroke="#ec4899" strokeWidth="1" />
          <text x="322" y="68" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold">Healthcare</text>
          <text x="322" y="84" textAnchor="middle" fill="#fbcfe8" fontSize="8">Patient Ed</text>
          <text x="322" y="100" textAnchor="middle" fill="#f472b6" fontSize="7">94% want HIPAA</text>
          
          <rect x="390" y="48" width="115" height="65" rx="8" fill="#042f2e" stroke="#f59e0b" strokeWidth="1" />
          <text x="447" y="68" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">Traveler</text>
          <text x="447" y="84" textAnchor="middle" fill="#fef3c7" fontSize="8">Location Story</text>
          <text x="447" y="100" textAnchor="middle" fill="#fbbf24" fontSize="7">76% want auto-edit</text>
          
          <rect x="515" y="48" width="110" height="65" rx="8" fill="#042f2e" stroke="#8b5cf6" strokeWidth="1" />
          <text x="570" y="68" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="bold">Enterprise</text>
          <text x="570" y="84" textAnchor="middle" fill="#e9d5ff" fontSize="8">White-label</text>
          <text x="570" y="100" textAnchor="middle" fill="#a78bfa" fontSize="7">SSO + Workflows</text>
        </g>
      </g>

      {/* User Quote */}
      <g transform="translate(50, 750)">
        <rect x="0" y="0" width="1500" height="60" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <text x="750" y="25" textAnchor="middle" fill="#78350f" fontSize="13" fontStyle="italic">
          "I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself." — TikTok Creator
        </text>
        <text x="750" y="48" textAnchor="middle" fill="#92400e" fontSize="11">
          This is why we're building mobile-first voice commands and AI auto-arrange (Phases 3-5)
        </text>
      </g>

      {/* Bottom Legend */}
      <g transform="translate(50, 830)">
        <rect x="0" y="0" width="1500" height="80" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="750" y="25" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">Competitive Advantages</text>
        <text x="150" y="50" textAnchor="middle" fill="#10b981" fontSize="11">✓ Unified Script→TTS→Record</text>
        <text x="400" y="50" textAnchor="middle" fill="#3b82f6" fontSize="11">✓ Bidirectional Vibe↔Mind</text>
        <text x="650" y="50" textAnchor="middle" fill="#f59e0b" fontSize="11">○ Mobile-First (Phase 3)</text>
        <text x="900" y="50" textAnchor="middle" fill="#ec4899" fontSize="11">○ HIPAA &lt;$100/mo (Phase 4)</text>
        <text x="1150" y="50" textAnchor="middle" fill="#8b5cf6" fontSize="11">○ Multi-Language Dub (Phase 5)</text>
        <text x="1400" y="50" textAnchor="middle" fill="#6366f1" fontSize="11">○ AI Remix (Phase 5)</text>
        
        <text x="150" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">vs CapCut, Canva gap</text>
        <text x="400" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">Unique feature</text>
        <text x="650" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">68% user demand</text>
        <text x="900" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">94% want affordable</text>
        <text x="1150" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">50+ languages</text>
        <text x="1400" y="70" textAnchor="middle" fill="#94a3b8" fontSize="9">82% want clips</text>
      </g>

      {/* Version Info */}
      <text x="1550" y="1085" textAnchor="end" fill="#475569" fontSize="10">
        v2.2 | 110 Scenarios | Last Updated: 2026-01-09
      </text>
    </svg>
  );

  const DiagramWrapper = () => (
    <div ref={diagramRef} className="p-4">
      <DiagramContent />
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-auto">
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-slate-900/90 backdrop-blur">
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2 text-white border-white/20 hover:bg-white/10">
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2 text-white border-white/20 hover:bg-white/10">
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="gap-2 text-white border-white/20 hover:bg-white/10">
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
        <DiagramWrapper />
      </div>
    );
  }

  return (
    <Card className="w-full border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Video className="h-5 w-5" />
            Genie Recording Studio Architecture (110 Scenarios)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Mind ↔ Vibe Bidirectional Flow • Mobile-First • 6 Market Segments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DiagramWrapper />
      </CardContent>
    </Card>
  );
};
