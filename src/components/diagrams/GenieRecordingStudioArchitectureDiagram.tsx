import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, X, FileImage, FileCode, Download } from 'lucide-react';
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
      viewBox="0 0 1600 1000"
      className="w-full h-auto"
      style={{ minHeight: '700px' }}
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
        <linearGradient id="contextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
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
      <rect width="1600" height="1000" fill="#0f172a" />

      {/* Title */}
      <text x="800" y="50" textAnchor="middle" fill="#ffffff" fontSize="32" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">
        Genie Mind ↔ Genie Vibe Architecture
      </text>
      <text x="800" y="80" textAnchor="middle" fill="#94a3b8" fontSize="16" fontFamily="system-ui, -apple-system, sans-serif">
        "From Mind to Media" — End-to-End Content Production Pipeline • Built in 4 Days
      </text>

      {/* GENIE STUDIO SECTION */}
      <g transform="translate(50, 110)">
        {/* Main Container */}
        <rect x="0" y="0" width="680" height="520" rx="16" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="3" filter="url(#dropShadow)" />
        
        {/* Header */}
        <rect x="0" y="0" width="680" height="60" rx="16" fill="url(#genieStudioGrad)" />
        <text x="340" y="38" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">🧞 Genie Mind</text>
        <text x="340" y="55" textAnchor="middle" fill="#e0e7ff" fontSize="11">AI That Understands — Pre-Production Command Center</text>

        {/* Project Management */}
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="14" fontWeight="bold">📁 Projects</text>
          <text x="100" y="50" textAnchor="middle" fill="#e0e7ff" fontSize="11">Create & Manage</text>
          <text x="100" y="70" textAnchor="middle" fill="#e0e7ff" fontSize="11">Production Projects</text>
          <rect x="20" y="85" width="160" height="30" rx="6" fill="#4338ca" />
          <text x="100" y="105" textAnchor="middle" fill="#ffffff" fontSize="10">Patient Onboarding v2</text>
        </g>

        {/* Script Management */}
        <g transform="translate(240, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="14" fontWeight="bold">📝 Scripts</text>
          <text x="100" y="50" textAnchor="middle" fill="#e0e7ff" fontSize="11">Write, Edit, Enhance</text>
          <text x="100" y="70" textAnchor="middle" fill="#e0e7ff" fontSize="11">with AI Assistance</text>
          <rect x="10" y="85" width="85" height="28" rx="6" fill="#059669" />
          <text x="52" y="103" textAnchor="middle" fill="#ffffff" fontSize="9">Original</text>
          <rect x="105" y="85" width="85" height="28" rx="6" fill="#7c3aed" />
          <text x="147" y="103" textAnchor="middle" fill="#ffffff" fontSize="9">AI Enhanced</text>
        </g>

        {/* TTS Generation */}
        <g transform="translate(460, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="14" fontWeight="bold">🔊 TTS Engine</text>
          <text x="100" y="50" textAnchor="middle" fill="#e0e7ff" fontSize="11">Text-to-Speech</text>
          <text x="100" y="70" textAnchor="middle" fill="#e0e7ff" fontSize="11">Generation</text>
          <rect x="20" y="85" width="70" height="28" rx="6" fill="#ec4899" />
          <text x="55" y="103" textAnchor="middle" fill="#ffffff" fontSize="9">ElevenLabs</text>
          <rect x="100" y="85" width="80" height="28" rx="6" fill="#8b5cf6" />
          <text x="140" y="103" textAnchor="middle" fill="#ffffff" fontSize="9">Fallbacks</text>
        </g>

        {/* Agent Canvas */}
        <g transform="translate(20, 230)">
          <rect x="0" y="0" width="310" height="120" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="25" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">🎨 Agent Canvas</text>
          <text x="155" y="48" textAnchor="middle" fill="#e0e7ff" fontSize="11">Visual Workflow Builder</text>
          
          {/* Mini workflow diagram */}
          <rect x="30" y="60" width="50" height="40" rx="4" fill="#2563eb" />
          <text x="55" y="84" textAnchor="middle" fill="#fff" fontSize="9">Start</text>
          <line x1="80" y1="80" x2="100" y2="80" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowheadBlue)" />
          <rect x="110" y="60" width="50" height="40" rx="4" fill="#7c3aed" />
          <text x="135" y="84" textAnchor="middle" fill="#fff" fontSize="9">Process</text>
          <line x1="160" y1="80" x2="180" y2="80" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowheadBlue)" />
          <rect x="190" y="60" width="50" height="40" rx="4" fill="#059669" />
          <text x="215" y="84" textAnchor="middle" fill="#fff" fontSize="9">End</text>
        </g>

        {/* Knowledge Base */}
        <g transform="translate(350, 230)">
          <rect x="0" y="0" width="310" height="120" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="25" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">📚 Knowledge Base</text>
          <text x="155" y="48" textAnchor="middle" fill="#e0e7ff" fontSize="11">RAG-Enabled Content Library</text>
          
          <rect x="20" y="60" width="80" height="45" rx="6" fill="#0d9488" />
          <text x="60" y="80" textAnchor="middle" fill="#fff" fontSize="9">Documents</text>
          <text x="60" y="95" textAnchor="middle" fill="#ccfbf1" fontSize="8">PDF, MD, TXT</text>
          
          <rect x="115" y="60" width="80" height="45" rx="6" fill="#0284c7" />
          <text x="155" y="80" textAnchor="middle" fill="#fff" fontSize="9">Media</text>
          <text x="155" y="95" textAnchor="middle" fill="#e0f2fe" fontSize="8">Audio, Video</text>
          
          <rect x="210" y="60" width="80" height="45" rx="6" fill="#9333ea" />
          <text x="250" y="80" textAnchor="middle" fill="#fff" fontSize="9">Vectors</text>
          <text x="250" y="95" textAnchor="middle" fill="#f3e8ff" fontSize="8">Embeddings</text>
        </g>

        {/* Production Context Builder */}
        <g transform="translate(20, 370)">
          <rect x="0" y="0" width="640" height="130" rx="12" fill="url(#contextGrad)" filter="url(#dropShadow)" />
          <text x="320" y="30" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">📦 Production Context Builder</text>
          <text x="320" y="50" textAnchor="middle" fill="#422006" fontSize="12">Bundles all assets for Genie Vibe handoff</text>
          
          <rect x="20" y="65" width="140" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="90" y="88" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">Scripts + Timings</text>
          <text x="90" y="105" textAnchor="middle" fill="#92400e" fontSize="9">With cue points</text>
          
          <rect x="180" y="65" width="140" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="250" y="88" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">TTS Audio Files</text>
          <text x="250" y="105" textAnchor="middle" fill="#92400e" fontSize="9">Generated voiceovers</text>
          
          <rect x="340" y="65" width="140" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="410" y="88" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">Project Metadata</text>
          <text x="410" y="105" textAnchor="middle" fill="#92400e" fontSize="9">Config & settings</text>
          
          <rect x="500" y="65" width="120" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <text x="560" y="88" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold">Music Tracks</text>
          <text x="560" y="105" textAnchor="middle" fill="#92400e" fontSize="9">Background audio</text>
        </g>
      </g>

      {/* DATA FLOW ARROW */}
      <g transform="translate(730, 350)">
        <rect x="0" y="0" width="140" height="80" rx="40" fill="url(#dataFlowGrad)" filter="url(#dropShadow)" />
        <text x="70" y="35" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">→</text>
        <text x="70" y="55" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Context</text>
        <text x="70" y="70" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Handoff</text>
      </g>

      {/* RECORDING STUDIO SECTION */}
      <g transform="translate(870, 110)">
        {/* Main Container */}
        <rect x="0" y="0" width="680" height="520" rx="16" fill="#042f2e" stroke="#059669" strokeWidth="3" filter="url(#dropShadow)" />
        
        {/* Header */}
        <rect x="0" y="0" width="680" height="60" rx="16" fill="url(#recordingStudioGrad)" />
        <text x="340" y="38" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">🎬 Genie Vibe</text>
        <text x="340" y="55" textAnchor="middle" fill="#d1fae5" fontSize="11">Script to Screen — Professional Recording Environment</text>

        {/* Teleprompter */}
        <g transform="translate(20, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#5eead4" fontSize="14" fontWeight="bold">📜 Teleprompter</text>
          <text x="100" y="50" textAnchor="middle" fill="#ccfbf1" fontSize="11">Synced Script Display</text>
          <text x="100" y="70" textAnchor="middle" fill="#ccfbf1" fontSize="11">Separate Window</text>
          <rect x="20" y="85" width="160" height="30" rx="6" fill="#0f766e" />
          <text x="100" y="105" textAnchor="middle" fill="#99f6e4" fontSize="10">↕ Draggable • Speed Control</text>
        </g>

        {/* Video Preview */}
        <g transform="translate(240, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#5eead4" fontSize="14" fontWeight="bold">📹 Video Preview</text>
          <text x="100" y="50" textAnchor="middle" fill="#ccfbf1" fontSize="11">Live Camera Feed</text>
          <text x="100" y="70" textAnchor="middle" fill="#ccfbf1" fontSize="11">+ Screen Capture</text>
          <rect x="10" y="85" width="55" height="28" rx="6" fill="#0891b2" />
          <text x="37" y="103" textAnchor="middle" fill="#fff" fontSize="8">Camera</text>
          <rect x="72" y="85" width="55" height="28" rx="6" fill="#7c3aed" />
          <text x="100" y="103" textAnchor="middle" fill="#fff" fontSize="8">Screen</text>
          <rect x="135" y="85" width="55" height="28" rx="6" fill="#059669" />
          <text x="162" y="103" textAnchor="middle" fill="#fff" fontSize="8">PiP</text>
        </g>

        {/* Audio Mixer */}
        <g transform="translate(460, 80)">
          <rect x="0" y="0" width="200" height="130" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="100" y="25" textAnchor="middle" fill="#5eead4" fontSize="14" fontWeight="bold">🎚️ Audio Mixer</text>
          <text x="100" y="50" textAnchor="middle" fill="#ccfbf1" fontSize="11">Floating Panel</text>
          <text x="100" y="70" textAnchor="middle" fill="#ccfbf1" fontSize="11">Multi-track Control</text>
          
          {/* Volume bars */}
          <rect x="30" y="85" width="12" height="30" rx="2" fill="#374151" />
          <rect x="30" y="100" width="12" height="15" rx="2" fill="#22c55e" />
          <text x="36" y="125" textAnchor="middle" fill="#9ca3af" fontSize="7">TTS</text>
          
          <rect x="60" y="85" width="12" height="30" rx="2" fill="#374151" />
          <rect x="60" y="95" width="12" height="20" rx="2" fill="#3b82f6" />
          <text x="66" y="125" textAnchor="middle" fill="#9ca3af" fontSize="7">VO</text>
          
          <rect x="90" y="85" width="12" height="30" rx="2" fill="#374151" />
          <rect x="90" y="105" width="12" height="10" rx="2" fill="#ec4899" />
          <text x="96" y="125" textAnchor="middle" fill="#9ca3af" fontSize="7">Music</text>
          
          <rect x="120" y="85" width="12" height="30" rx="2" fill="#374151" />
          <rect x="120" y="90" width="12" height="25" rx="2" fill="#f59e0b" />
          <text x="126" y="125" textAnchor="middle" fill="#9ca3af" fontSize="7">Mic</text>
          
          <text x="160" y="100" textAnchor="middle" fill="#5eead4" fontSize="9">Ducking</text>
          <text x="160" y="115" textAnchor="middle" fill="#14b8a6" fontSize="11">ON</text>
        </g>

        {/* Recording Controls */}
        <g transform="translate(20, 230)">
          <rect x="0" y="0" width="310" height="120" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="25" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">🎛️ Recording Controls</text>
          <text x="155" y="48" textAnchor="middle" fill="#e0e7ff" fontSize="11">Collapsible Control Bar</text>
          
          <circle cx="50" cy="85" r="25" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
          <text x="50" y="90" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">REC</text>
          
          <circle cx="120" cy="85" r="20" fill="#0ea5e9" />
          <text x="120" y="90" textAnchor="middle" fill="#fff" fontSize="18">⏸</text>
          
          <circle cx="180" cy="85" r="20" fill="#6366f1" />
          <text x="180" y="90" textAnchor="middle" fill="#fff" fontSize="18">⏹</text>
          
          <rect x="220" y="65" width="70" height="40" rx="6" fill="#059669" />
          <text x="255" y="82" textAnchor="middle" fill="#fff" fontSize="9">Countdown</text>
          <text x="255" y="96" textAnchor="middle" fill="#bbf7d0" fontSize="12" fontWeight="bold">3s</text>
        </g>

        {/* Export & Library */}
        <g transform="translate(350, 230)">
          <rect x="0" y="0" width="310" height="120" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="25" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">💾 Export & Library</text>
          <text x="155" y="48" textAnchor="middle" fill="#e0e7ff" fontSize="11">Save & Download Options</text>
          
          <rect x="15" y="60" width="65" height="45" rx="6" fill="#7c3aed" />
          <text x="47" y="80" textAnchor="middle" fill="#fff" fontSize="9">MP4</text>
          <text x="47" y="95" textAnchor="middle" fill="#e0e7ff" fontSize="8">HD/4K</text>
          
          <rect x="90" y="60" width="65" height="45" rx="6" fill="#0891b2" />
          <text x="122" y="80" textAnchor="middle" fill="#fff" fontSize="9">WebM</text>
          <text x="122" y="95" textAnchor="middle" fill="#e0f2fe" fontSize="8">Web-ready</text>
          
          <rect x="165" y="60" width="65" height="45" rx="6" fill="#059669" />
          <text x="197" y="80" textAnchor="middle" fill="#fff" fontSize="9">Audio</text>
          <text x="197" y="95" textAnchor="middle" fill="#d1fae5" fontSize="8">MP3/WAV</text>
          
          <rect x="240" y="60" width="55" height="45" rx="6" fill="#f59e0b" />
          <text x="267" y="80" textAnchor="middle" fill="#1e293b" fontSize="9">SRT</text>
          <text x="267" y="95" textAnchor="middle" fill="#422006" fontSize="8">Captions</text>
        </g>

        {/* Media Processing */}
        <g transform="translate(20, 370)">
          <rect x="0" y="0" width="640" height="130" rx="12" fill="url(#mediaGrad)" filter="url(#dropShadow)" />
          <text x="320" y="30" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">⚙️ Media Processing Pipeline</text>
          <text x="320" y="50" textAnchor="middle" fill="#e0f2fe" fontSize="12">FFmpeg.wasm • Web Audio API • MediaRecorder</text>
          
          <rect x="20" y="65" width="140" height="50" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
          <text x="90" y="88" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Video Capture</text>
          <text x="90" y="105" textAnchor="middle" fill="#93c5fd" fontSize="9">Screen + Camera</text>
          
          <rect x="180" y="65" width="140" height="50" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
          <text x="250" y="88" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Audio Mixing</text>
          <text x="250" y="105" textAnchor="middle" fill="#93c5fd" fontSize="9">Real-time blend</text>
          
          <rect x="340" y="65" width="140" height="50" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
          <text x="410" y="88" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Transcoding</text>
          <text x="410" y="105" textAnchor="middle" fill="#93c5fd" fontSize="9">Format conversion</text>
          
          <rect x="500" y="65" width="120" height="50" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
          <text x="560" y="88" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Compression</text>
          <text x="560" y="105" textAnchor="middle" fill="#93c5fd" fontSize="9">Optimized output</text>
        </g>
      </g>

      {/* BOTTOM SECTION - Key Technologies */}
      <g transform="translate(50, 680)">
        <rect x="0" y="0" width="1500" height="280" rx="16" fill="#1e293b" stroke="#475569" strokeWidth="2" filter="url(#dropShadow)" />
        
        {/* Header */}
        <rect x="0" y="0" width="1500" height="50" rx="16" fill="#334155" />
        <text x="750" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">🛠️ Technology Stack & Key Patterns</text>

        {/* Tech Cards */}
        <g transform="translate(30, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="bold">Frontend</text>
          <text x="110" y="48" textAnchor="middle" fill="#e0e7ff" fontSize="11">React • TypeScript</text>
          <text x="110" y="68" textAnchor="middle" fill="#e0e7ff" fontSize="11">Tailwind • Radix UI</text>
          <text x="110" y="85" textAnchor="middle" fill="#818cf8" fontSize="10">Framer Motion</text>
        </g>

        <g transform="translate(270, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#86efac" fontSize="13" fontWeight="bold">Recording</text>
          <text x="110" y="48" textAnchor="middle" fill="#d1fae5" fontSize="11">MediaRecorder API</text>
          <text x="110" y="68" textAnchor="middle" fill="#d1fae5" fontSize="11">Web Audio API</text>
          <text x="110" y="85" textAnchor="middle" fill="#4ade80" fontSize="10">Canvas Compositing</text>
        </g>

        <g transform="translate(510, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#fca5a5" fontSize="13" fontWeight="bold">Processing</text>
          <text x="110" y="48" textAnchor="middle" fill="#fee2e2" fontSize="11">FFmpeg.wasm</text>
          <text x="110" y="68" textAnchor="middle" fill="#fee2e2" fontSize="11">In-browser encoding</text>
          <text x="110" y="85" textAnchor="middle" fill="#f87171" fontSize="10">No server needed</text>
        </g>

        <g transform="translate(750, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#701a75" stroke="#e879f9" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#f0abfc" fontSize="13" fontWeight="bold">AI Integration</text>
          <text x="110" y="48" textAnchor="middle" fill="#fae8ff" fontSize="11">ElevenLabs TTS</text>
          <text x="110" y="68" textAnchor="middle" fill="#fae8ff" fontSize="11">Gemini Enhancement</text>
          <text x="110" y="85" textAnchor="middle" fill="#e879f9" fontSize="10">Edge Functions</text>
        </g>

        <g transform="translate(990, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#7dd3fc" fontSize="13" fontWeight="bold">State Management</text>
          <text x="110" y="48" textAnchor="middle" fill="#e0f2fe" fontSize="11">Custom React Hooks</text>
          <text x="110" y="68" textAnchor="middle" fill="#e0f2fe" fontSize="11">Context + Zustand</text>
          <text x="110" y="85" textAnchor="middle" fill="#38bdf8" fontSize="10">Real-time sync</text>
        </g>

        <g transform="translate(1230, 70)">
          <rect x="0" y="0" width="220" height="90" rx="10" fill="#422006" stroke="#fbbf24" strokeWidth="2" />
          <text x="110" y="25" textAnchor="middle" fill="#fcd34d" fontSize="13" fontWeight="bold">Backend</text>
          <text x="110" y="48" textAnchor="middle" fill="#fef3c7" fontSize="11">Supabase</text>
          <text x="110" y="68" textAnchor="middle" fill="#fef3c7" fontSize="11">Edge Functions</text>
          <text x="110" y="85" textAnchor="middle" fill="#fbbf24" fontSize="10">Secure API Layer</text>
        </g>

        {/* Key Stats */}
        <g transform="translate(30, 180)">
          <text x="0" y="20" fill="#94a3b8" fontSize="14">Built in</text>
          <text x="75" y="20" fill="#22c55e" fontSize="18" fontWeight="bold">4 Days</text>
          <text x="150" y="20" fill="#94a3b8" fontSize="14">over New Year's Weekend 2025</text>
          
          <text x="450" y="20" fill="#94a3b8" fontSize="14">Using</text>
          <text x="510" y="20" fill="#a78bfa" fontSize="18" fontWeight="bold">Lovable</text>
          <text x="610" y="20" fill="#94a3b8" fontSize="14">+ Vibe-Based Development</text>
          
          <text x="900" y="20" fill="#94a3b8" fontSize="14">Result:</text>
          <text x="970" y="20" fill="#f59e0b" fontSize="18" fontWeight="bold">Production-Ready</text>
          <text x="1150" y="20" fill="#94a3b8" fontSize="14">Genie Vibe</text>
        </g>
      </g>
    </svg>
  );

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'bg-slate-900 border-slate-700'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Genie Mind ↔ Genie Vibe Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Close' : 'Fullscreen'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`p-4 ${isFullscreen ? 'h-[calc(100vh-80px)] overflow-auto' : ''}`}>
        <div 
          ref={diagramRef} 
          className={`relative w-full overflow-auto rounded-lg border border-slate-700 ${isFullscreen ? 'min-h-full' : ''}`}
        >
          <DiagramContent />
        </div>
        <p className="text-slate-500 text-xs mt-3 text-center">
          Genie Mind (Pre-Production) → Context Handoff → Genie Vibe (Production) • "From Mind to Media" Pipeline
        </p>
      </CardContent>
    </Card>
  );
};

export default GenieRecordingStudioArchitectureDiagram;
