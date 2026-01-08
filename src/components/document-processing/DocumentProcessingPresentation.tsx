import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, 
  Download, FileText, X, Sparkles, TrendingUp, Zap, Target, 
  Layers, ArrowRight, AlertCircle, CheckCircle, DollarSign,
  Clock, Users, Bot, Settings, Database, GitBranch, Eye,
  Upload, FileCheck, Cpu, Send, BrainCircuit, Workflow,
  BarChart3, Building, Shield, Lightbulb, Presentation,
  ExternalLink, Pill, Activity, Server, Link2, Globe,
  Stethoscope, ClipboardList, HeartPulse, RefreshCw,
  Linkedin, Share2, Code, FileJson, Play as PlayIcon,
  Rocket, Palette, MonitorPlay, PenTool, TestTube,
  MousePointerClick, ArrowDown, CircleDot, Boxes,
  Network, Hammer, Factory, Package, FileCode,
  ChevronDown, Check, Star, Crown, Wrench, Image, FileImage
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { usePresentationShare } from '@/hooks/usePresentationShare';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
  pptContent?: {
    bullets?: string[];
    notes?: string;
  };
}

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Enhanced Animated Components
const DataFlowDot = ({ delay = 0, color = "cyan", path }: { delay?: number; color?: string; path: string }) => (
  <motion.circle
    r="4"
    fill={`url(#${color}Glow)`}
    initial={{ offsetDistance: "0%" }}
    animate={{ offsetDistance: "100%" }}
    transition={{ duration: 2, delay, repeat: Infinity, ease: "linear" }}
    style={{ offsetPath: `path('${path}')` }}
  />
);

const PulsingNode = ({ children, color, size = "w-16 h-16", delay = 0 }: { children: React.ReactNode; color: string; size?: string; delay?: number }) => (
  <motion.div
    className={`${size} relative flex items-center justify-center`}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring" }}
  >
    <motion.div
      className={`absolute inset-0 bg-${color}-400/30 rounded-full blur-xl`}
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    />
    <div className={`${size} bg-${color}-500/20 border-2 border-${color}-400 rounded-xl flex items-center justify-center relative z-10`}>
      {children}
    </div>
  </motion.div>
);

const AnimatedConnection = ({ delay = 0 }: { delay?: number }) => (
  <div className="flex-1 mx-3 relative h-8 flex items-center">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full h-0.5 bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
    </div>
    <motion.div
      className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
      animate={{ x: [0, 80] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay }}
    />
  </div>
);

// =============================================================================
// SLIDE 0: INTRO - Visual Story Opening
// =============================================================================
const IntroSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    {/* Hero Section with Infographic */}
    <motion.div 
      {...fadeInUp}
      className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl p-6 overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
        animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex items-center gap-6">
        {/* Left: Infographic Character */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex-shrink-0"
        >
          <div className="w-40 h-40 relative">
            {/* Desk with papers */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-amber-800/80 rounded-t-lg" />
            <div className="absolute bottom-10 left-3 right-3 space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="h-2.5 bg-white rounded shadow-sm"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{ marginLeft: `${i * 3}px` }}
                />
              ))}
            </div>
            {/* Stressed person emoji */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-6xl"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              😰
            </motion.div>
            {/* Flying papers */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-8 bg-white rounded shadow-lg"
                initial={{ x: 60, y: 50, rotate: 0, opacity: 0 }}
                animate={{ 
                  x: [60, 100 + i * 15], 
                  y: [50, 15 - i * 12], 
                  rotate: [0, 15 + i * 8],
                  opacity: [0, 1, 0.7]
                }}
                transition={{ 
                  delay: 1 + i * 0.2, 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Right: Story Text */}
        <div className="flex-1 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 mb-2">
              <AlertCircle className="w-3 h-3 mr-1" /> The Problem I've Been Seeing
            </Badge>
            <h2 className="text-2xl font-bold text-white leading-tight">
              "For a long time, I watched healthcare teams
              <motion.span
                className="text-red-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              > struggle </motion.span>
              with documents..."
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-indigo-200"
          >
            Companies paying <span className="text-amber-400 font-bold">heavy money for partners</span> to build basic document tools.
            <br />
            But with new AI tools like <span className="text-purple-400 font-bold">Lovable</span>, I knew I could build something better.
          </motion.p>
        </div>
      </div>
    </motion.div>

    {/* AI Democratization Banner */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI is Democratizing Development</p>
            <p className="text-purple-300 text-xs">What used to take 6+ months and $300K+ can now be built in weeks</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold text-lg">&lt; 1 Week</p>
            <p className="text-green-300 text-xs">Build Time</p>
          </div>
          <div className="text-center px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 font-bold text-lg">Production Ready</p>
            <p className="text-blue-300 text-xs">Built with Lovable</p>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Journey Preview Cards */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { step: "1", emoji: "😰", title: "The Challenge", desc: "What I kept seeing", color: "red" },
        { step: "2", emoji: "🔍", title: "My Learnings", desc: "Experimentation", color: "orange" },
        { step: "3", emoji: "💡", title: "The Solution", desc: "What I built", color: "blue" },
        { step: "4", emoji: "🚀", title: "The Result", desc: "Production ready", color: "green" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + i * 0.1 }}
          className={`bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/5 rounded-xl p-3 border border-${item.color}-500/30 text-center`}
        >
          <div className="text-2xl mb-1">{item.emoji}</div>
          <div className={`text-xs font-bold text-${item.color}-400 uppercase tracking-wide`}>Step {item.step}</div>
          <h4 className="font-bold text-white text-sm mt-1">{item.title}</h4>
          <p className="text-xs text-slate-400">{item.desc}</p>
        </motion.div>
      ))}
    </div>

    {/* Bottom CTA */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
      className="text-center"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center justify-center gap-2 text-indigo-300"
      >
        <span className="text-sm">Let me share my learnings and what I built</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 1: PROBLEM STATEMENT - Healthcare Document Crisis
// =============================================================================
const ProblemStatementSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    {/* Hero Banner - Better contrast */}
    <motion.div 
      {...fadeInUp}
      className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 text-white overflow-hidden border border-red-500/30"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-orange-600/10"
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 mb-2">
              <AlertCircle className="w-3 h-3 mr-1" /> Healthcare Document Crisis
            </Badge>
            <h3 className="text-2xl font-bold text-white">The Problem I've Been Seeing for Years</h3>
            <p className="text-base text-slate-300">"Every organization I worked with faced the same struggle — drowning in paperwork."</p>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "4+", label: "Hours/Day", sub: "Manual Entry" },
            { value: "$50", label: "Per Document", sub: "Processing Cost" },
            { value: "30%", label: "Error Rate", sub: "Industry Average" },
            { value: "48hr", label: "Turnaround", sub: "Average Time" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-slate-900/80 backdrop-blur rounded-lg p-3 text-center border border-slate-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="text-2xl font-bold text-red-400">{stat.value}</div>
              <div className="text-xs text-white font-medium">{stat.label}</div>
              <div className="text-xs text-slate-400">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>

    {/* Pain Points Flow - High contrast cards */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { icon: Clock, title: "Time Drain", desc: "Staff spend hours on repetitive data entry", impact: "Lost productivity", bgColor: "bg-red-600", borderColor: "border-red-500" },
        { icon: DollarSign, title: "High Costs", desc: "$15-50 per document for manual processing", impact: "$500K+ annually", bgColor: "bg-orange-600", borderColor: "border-orange-500" },
        { icon: AlertCircle, title: "Error Prone", desc: "15-30% error rates in manual extraction", impact: "Compliance risk", bgColor: "bg-amber-600", borderColor: "border-amber-500" },
        { icon: Users, title: "Staff Burnout", desc: "Repetitive tasks lead to high turnover", impact: "60% more turnover", bgColor: "bg-purple-600", borderColor: "border-purple-500" },
      ].map((pain, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className="relative"
        >
          <div className={`${pain.bgColor} rounded-xl p-4 h-full text-white shadow-lg border-2 ${pain.borderColor}`}>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
              <pain.icon className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">{pain.title}</h4>
            <p className="text-xs text-white/90 mb-2">{pain.desc}</p>
            <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold">{pain.impact}</Badge>
          </div>
          {i < 3 && (
            <motion.div
              className="absolute top-1/2 -right-2 z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>

    {/* Bottom Impact Statement */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="bg-slate-800 rounded-xl p-3 border border-slate-600 text-center"
    >
      <p className="text-base font-medium text-white">
        <strong className="text-red-400">This Is The Crisis:</strong> Companies keep paying heavy money to partners for solutions that don't really work.
        <span className="text-emerald-400 font-bold"> I knew AI could change this — so I built something myself.</span>
      </p>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 2: CURRENT TOOLS - Sharing My Learnings & Experimentation
// =============================================================================
const CurrentToolsSlide = () => (
  <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-base px-4 py-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
        <Lightbulb className="w-4 h-4 mr-2 inline" />
        Sharing My Learnings & Experimentation
      </Badge>
      <p className="text-sm text-slate-400 mt-2">"I experimented with these approaches — here's what I learned about why they fall short."</p>
    </motion.div>

    <div className="grid grid-cols-3 gap-4">
      {[
        {
          title: "Traditional OCR",
          icon: FileText,
          status: "Legacy",
          problems: ["Template-based extraction", "Single model approach", "High error rates (20%+)", "No context understanding", "Manual configuration"],
          accuracy: "60-70%",
          effort: "High",
          bgColor: "bg-slate-800",
          iconBg: "bg-red-600",
          statusBg: "bg-red-500/20 text-red-300"
        },
        {
          title: "Rule-Based Systems",
          icon: Settings,
          status: "Rigid",
          problems: ["Hard-coded rules", "Breaks with format changes", "Extensive maintenance", "No adaptability", "High implementation cost"],
          accuracy: "70-80%",
          effort: "100+ hrs/month",
          bgColor: "bg-slate-800",
          iconBg: "bg-orange-600",
          statusBg: "bg-orange-500/20 text-orange-300"
        },
        {
          title: "Single AI Model",
          icon: Bot,
          status: "Limited",
          problems: ["One-size-fits-all", "Poor on specialized docs", "No model optimization", "High token costs", "Inconsistent results"],
          accuracy: "75-85%",
          effort: "3-5x cost",
          bgColor: "bg-slate-800",
          iconBg: "bg-amber-600",
          statusBg: "bg-amber-500/20 text-amber-300"
        }
      ].map((tool, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, rotateY: -20 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: i * 0.2, type: "spring" }}
          className={`${tool.bgColor} rounded-xl p-5 border border-slate-600 shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center shadow-md`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">{tool.title}</h4>
              <Badge className={`${tool.statusBg} text-xs font-semibold border-0`}>{tool.status}</Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {tool.problems.map((problem, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + j * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-slate-200">{problem}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-red-500/20 rounded-lg text-center border border-red-500/30">
              <div className="text-xs text-red-300 font-semibold">Accuracy</div>
              <div className="text-sm font-bold text-white">{tool.accuracy}</div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg text-center border border-orange-500/30">
              <div className="text-xs text-orange-300 font-semibold">Effort</div>
              <div className="text-sm font-bold text-white">{tool.effort}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Transformation Arrow */}
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
      className="flex items-center justify-center gap-4 py-3"
    >
      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-emerald-500" />
      <div className="flex flex-col items-center bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 rounded-full">
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-base font-bold text-white">Time for a Revolution</span>
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </div>
      <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-500 to-transparent" />
    </motion.div>

    {/* Solution Preview */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-5 text-center shadow-xl"
    >
      <h4 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
        <BrainCircuit className="w-6 h-6 text-yellow-300" />
        That's When I Had the Idea
      </h4>
      <p className="text-emerald-100 text-base">
        "What if AI could intelligently route each document to the <strong className="text-yellow-300">best model for that specific task</strong>?"
      </p>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 3: AI TRANSFORMATION - How I Used AI to Transform the Process
// =============================================================================
const AITransformationSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <Sparkles className="w-4 h-4 mr-2 inline" />
        The AI Transformation I Designed
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">"I reimagined the entire workflow from scratch."</p>
    </motion.div>

    {/* Before vs After Visual */}
    <div className="grid grid-cols-2 gap-6">
      {/* Before */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 border border-gray-300 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-gray-500 text-white border-gray-600">BEFORE</Badge>
        </div>
        <h4 className="text-xl font-bold text-gray-700 mb-4">Manual Process</h4>
        
        <div className="space-y-4">
          {[
            { step: "1", label: "Receive Document", time: "5 min" },
            { step: "2", label: "Identify Document Type", time: "3 min" },
            { step: "3", label: "Manual Data Entry", time: "15 min" },
            { step: "4", label: "Cross-Reference Check", time: "10 min" },
            { step: "5", label: "Error Correction", time: "8 min" },
            { step: "6", label: "System Entry", time: "5 min" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-2 bg-white/50 rounded-lg"
            >
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {item.step}
              </div>
              <span className="flex-1 text-gray-600">{item.label}</span>
              <Badge variant="outline" className="text-gray-500">{item.time}</Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-red-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">46 min</div>
          <div className="text-sm text-red-500">Per Document</div>
        </div>
      </motion.div>

      {/* After */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-300 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500 text-white">AFTER AI</Badge>
        </div>
        <h4 className="text-xl font-bold text-green-700 mb-4">AI-Powered Process</h4>
        
        <div className="space-y-4">
          {[
            { step: "1", label: "Upload & Auto-Detect", time: "< 1 sec", icon: Upload },
            { step: "2", label: "AI Classification", time: "< 2 sec", icon: BrainCircuit },
            { step: "3", label: "Multi-Model Extraction", time: "< 3 sec", icon: Cpu },
            { step: "4", label: "Auto-Validation", time: "< 1 sec", icon: Shield },
            { step: "5", label: "Review & Confirm", time: "30 sec", icon: Eye },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 p-2 bg-white/70 rounded-lg"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-green-700 font-medium">{item.label}</span>
              <Badge className="bg-green-100 text-green-700 border-green-300">{item.time}</Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">37 sec</div>
          <div className="text-sm text-green-600">Per Document</div>
        </div>
      </motion.div>
    </div>

    {/* Impact Metrics */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="grid grid-cols-4 gap-4"
    >
      {[
        { icon: Clock, metric: "75x", label: "Faster Processing", color: "blue" },
        { icon: Target, metric: "95%+", label: "Accuracy Rate", color: "green" },
        { icon: DollarSign, metric: "90%", label: "Cost Reduction", color: "yellow" },
        { icon: Users, metric: "10x", label: "Staff Efficiency", color: "purple" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
          className={`text-center p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}
        >
          <item.icon className={`w-8 h-8 text-${item.color}-500 mx-auto mb-2`} />
          <div className={`text-3xl font-bold text-${item.color}-600`}>{item.metric}</div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 4: MULTI-MODEL ROUTING - The Core Innovation I Built
// =============================================================================
const WhyMultiModelSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <BrainCircuit className="w-4 h-4 mr-2 inline" />
        The Core Innovation: Intelligent Routing
      </Badge>
      <p className="text-sm text-muted-foreground mt-1">"I taught the system to pick the right AI for each job automatically."</p>
    </motion.div>

    {/* Full Animated Architecture */}
    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-r from-slate-900 via-purple-900/90 to-indigo-900 rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10">
        <h4 className="text-white font-bold text-center mb-6 text-lg">Real-Time Intelligent Routing Architecture</h4>
        
        <svg className="w-full h-48" viewBox="0 0 800 180">
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="cyanGlow"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="transparent"/></radialGradient>
            <radialGradient id="purpleGlow"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="transparent"/></radialGradient>
            <radialGradient id="yellowGlow"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="transparent"/></radialGradient>
          </defs>

          {/* Document Input Node */}
          <g>
            <rect x="20" y="60" width="80" height="60" rx="12" fill="url(#lineGrad1)" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2"/>
            <text x="60" y="85" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Document</text>
            <text x="60" y="105" fill="#93c5fd" fontSize="10" textAnchor="middle">Any Format</text>
          </g>

          {/* Connection Line 1 */}
          <motion.line x1="100" y1="90" x2="180" y2="90" stroke="url(#lineGrad1)" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }}/>
          
          {/* Animated Dots on Line 1 */}
          <motion.circle r="5" fill="#22d3ee" filter="url(#glow)"
            initial={{ cx: 100, cy: 90 }} animate={{ cx: [100, 180], cy: 90 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}/>

          {/* Auto-Config Node */}
          <g>
            <motion.rect x="180" y="55" width="100" height="70" rx="12" fill="#6366f1" fillOpacity="0.3" stroke="#818cf8" strokeWidth="2"
              animate={{ strokeOpacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}/>
            <text x="230" y="82" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Auto-Config</text>
            <text x="230" y="100" fill="#c4b5fd" fontSize="9" textAnchor="middle">Type Detection</text>
            <text x="230" y="115" fill="#c4b5fd" fontSize="9" textAnchor="middle">Field Mapping</text>
          </g>

          {/* Connection Line 2 */}
          <motion.line x1="280" y1="90" x2="360" y2="90" stroke="url(#lineGrad2)" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }}/>
          
          {/* Animated Dots on Line 2 */}
          <motion.circle r="5" fill="#a855f7" filter="url(#glow)"
            initial={{ cx: 280, cy: 90 }} animate={{ cx: [280, 360], cy: 90 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}/>

          {/* AI Router Brain (Central) */}
          <g>
            <motion.circle cx="420" cy="90" r="55" fill="#fbbf24" fillOpacity="0.2" stroke="#fbbf24" strokeWidth="2"
              animate={{ r: [55, 58, 55], strokeOpacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}/>
            <motion.circle cx="420" cy="90" r="70" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.3"
              animate={{ r: [70, 80, 70], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}/>
            <text x="420" y="80" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">AI Router</text>
            <text x="420" y="95" fill="#fde68a" fontSize="10" textAnchor="middle">Intelligence</text>
            <text x="420" y="108" fill="#fde68a" fontSize="9" textAnchor="middle">Layer</text>
          </g>

          {/* Branching Paths to Models */}
          <motion.path d="M 475 70 Q 520 30 580 15" fill="none" stroke="#f97316" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }}/>
          <motion.path d="M 475 82 Q 520 60 580 55" fill="none" stroke="#22c55e" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.5 }}/>
          <motion.path d="M 475 98 Q 520 120 580 95" fill="none" stroke="#3b82f6" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.0, duration: 0.5 }}/>
          <motion.path d="M 475 110 Q 520 150 580 135" fill="none" stroke="#8b5cf6" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.5 }}/>

          {/* Model Nodes */}
          {[
            { y: 5, name: "Claude", task: "Medical", color: "#f97316", acc: "98%" },
            { y: 45, name: "GPT-5", task: "Handwriting", color: "#22c55e", acc: "96%" },
            { y: 85, name: "Gemini Flash", task: "Tables", color: "#3b82f6", acc: "97%" },
            { y: 125, name: "Gemini Pro", task: "Images", color: "#8b5cf6", acc: "95%" },
          ].map((model, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}>
              <rect x="580" y={model.y} width="100" height="30" rx="6" fill={model.color} fillOpacity="0.2" stroke={model.color} strokeWidth="1.5"/>
              <text x="630" y={model.y + 14} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">{model.name}</text>
              <text x="630" y={model.y + 25} fill={model.color} fontSize="8" textAnchor="middle">→ {model.task}</text>
              <rect x="685" y={model.y + 5} width="30" height="18" rx="4" fill={model.color}/>
              <text x="700" y={model.y + 17} fill="white" fontSize="8" textAnchor="middle">{model.acc}</text>
            </motion.g>
          ))}

          {/* Output Node */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <rect x="720" y="65" width="70" height="40" rx="8" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2"/>
            <text x="755" y="83" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">Extracted</text>
            <text x="755" y="97" fill="#86efac" fontSize="9" textAnchor="middle">Data</text>
          </motion.g>
        </svg>
      </div>
    </motion.div>

    {/* Model Details Cards */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { 
          model: "Claude Sonnet", 
          icon: "🟠", 
          color: "orange",
          tasks: ["Medical Records", "Complex Forms", "Prior Auth"],
          strength: "Superior reasoning & context",
          example: "Patient history with multiple conditions"
        },
        { 
          model: "GPT-5 Vision", 
          icon: "🟢", 
          color: "green",
          tasks: ["Handwritten Rx", "Signatures", "Annotations"],
          strength: "Best-in-class handwriting OCR",
          example: "Doctor's handwritten prescription"
        },
        { 
          model: "Gemini 2.5 Flash", 
          icon: "🔵", 
          color: "blue",
          tasks: ["Lab Results", "Tables", "Structured Data"],
          strength: "Fast processing, tabular data",
          example: "Blood work results with ranges"
        },
        { 
          model: "Gemini 2.5 Pro", 
          icon: "🟣", 
          color: "purple",
          tasks: ["Medical Images", "X-rays", "DICOM"],
          strength: "Multi-modal image analysis",
          example: "Imaging with annotations"
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1 }}
          className={`bg-gradient-to-br from-${item.color}-50 to-white rounded-xl p-4 border border-${item.color}-200 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{item.icon}</span>
            <h4 className="font-bold text-sm text-foreground">{item.model}</h4>
          </div>
          
          <div className="space-y-1.5 mb-3">
            {item.tasks.map((task, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs">
                <Check className={`w-3 h-3 text-${item.color}-500`} />
                <span className="text-muted-foreground">{task}</span>
              </div>
            ))}
          </div>
          
          <div className={`p-2 bg-${item.color}-50 rounded-lg border border-${item.color}-100`}>
            <p className="text-xs text-muted-foreground italic">"{item.example}"</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// =============================================================================
// SLIDE 5: DOCUMENT CONFIGURATION - Zero Config Magic
// =============================================================================
const DocumentConfigSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <Settings className="w-4 h-4 mr-2 inline" />
        Zero-Config Auto-Detection I Developed
      </Badge>
      <p className="text-sm text-muted-foreground mt-1">"Upload any document. The system figures out everything else."</p>
    </motion.div>

    {/* Animated Pipeline */}
    <motion.div
      {...fadeInUp}
      className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-6 relative overflow-hidden"
    >
      <svg className="w-full h-32" viewBox="0 0 900 120">
        <defs>
          <linearGradient id="configGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="50%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#22c55e"/>
          </linearGradient>
        </defs>

        {/* Main Flow Line */}
        <motion.path
          d="M 50 60 L 850 60"
          fill="none"
          stroke="url(#configGrad)"
          strokeWidth="3"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Flow Nodes */}
        {[
          { x: 80, icon: "📄", label: "Upload", sub: "Any format" },
          { x: 230, icon: "👁️", label: "Analyze", sub: "Visual scan" },
          { x: 380, icon: "🧠", label: "Classify", sub: "AI detection" },
          { x: 530, icon: "⚙️", label: "Configure", sub: "Auto mapping" },
          { x: 680, icon: "✨", label: "Route", sub: "Best model" },
          { x: 830, icon: "✅", label: "Extract", sub: "High accuracy" },
        ].map((node, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}>
            <circle cx={node.x} cy="60" r="28" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2"/>
            <text x={node.x} y="65" fill="white" fontSize="18" textAnchor="middle">{node.icon}</text>
            <text x={node.x} y="100" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">{node.label}</text>
            <text x={node.x} y="115" fill="#94a3b8" fontSize="9" textAnchor="middle">{node.sub}</text>
          </motion.g>
        ))}

        {/* Animated data particles */}
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.circle key={i} r="5" fill="#22d3ee"
            initial={{ cx: 50, cy: 60 }}
            animate={{ cx: [50, 850], cy: 60 }}
            transition={{ duration: 3, delay, repeat: Infinity, ease: "linear" }}/>
        ))}
      </svg>
    </motion.div>

    <div className="grid grid-cols-2 gap-4">
      {/* What Gets Detected */}
      <motion.div {...fadeInUp} className="bg-white rounded-xl p-5 border shadow-sm">
        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Auto-Detected Properties
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: FileText, label: "Document Type", value: "Prescription" },
            { icon: Globe, label: "Language", value: "English" },
            { icon: RotateCcw, label: "Orientation", value: "Portrait" },
            { icon: Star, label: "Quality Level", value: "High" },
            { icon: PenTool, label: "Handwriting", value: "Detected" },
            { icon: Boxes, label: "Tables", value: "2 found" },
            { icon: CheckCircle, label: "Signatures", value: "Present" },
            { icon: Building, label: "Letterhead", value: "Identified" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
            >
              <item.icon className="w-4 h-4 text-blue-500" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm font-medium text-foreground">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Generated Configuration */}
      <motion.div {...fadeInUp} className="bg-white rounded-xl p-5 border shadow-sm">
        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-500" />
          Auto-Generated Configuration
        </h4>
        <motion.div 
          className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <pre className="text-green-400 text-xs leading-relaxed">{`{
  "documentType": "prescription",
  "confidence": 0.96,
  "detectedElements": {
    "handwriting": true,
    "signatures": 1,
    "tables": 0
  },
  "routing": {
    "stage1": "gpt-5-vision",
    "stage2": "claude-sonnet-4"
  },
  "fields": [
    "patient_name", "dob", 
    "medications", "dosage",
    "provider_npi", "signature"
  ]
}`}</pre>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);

// =============================================================================
// SLIDE 6: TWO-STAGE PIPELINE - My Processing Architecture
// =============================================================================
const TwoStagePipelineSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <GitBranch className="w-4 h-4 mr-2 inline" />
        The Two-Stage Pipeline I Architected
      </Badge>
      <p className="text-sm text-muted-foreground mt-1">"Vision first, then intelligence. Each stage optimized for its job."</p>
    </motion.div>

    {/* Full Pipeline Visualization */}
    <motion.div
      {...fadeInUp}
      className="bg-gradient-to-r from-blue-900 via-green-900 to-emerald-900 rounded-2xl p-6 relative overflow-hidden"
    >
      <svg className="w-full h-48" viewBox="0 0 900 180">
        <defs>
          <linearGradient id="stage1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
          <linearGradient id="stage2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
        </defs>

        {/* Stage 1 Box */}
        <motion.rect x="40" y="20" width="350" height="140" rx="16" fill="url(#stage1Grad)" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2"
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}/>
        <text x="215" y="45" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">STAGE 1: Classification + OCR</text>
        <text x="215" y="62" fill="#93c5fd" fontSize="10" textAnchor="middle">Vision AI Processing</text>

        {/* Stage 1 Steps */}
        {[
          { x: 80, icon: "📷", label: "Visual Analysis" },
          { x: 180, icon: "📝", label: "Text OCR" },
          { x: 280, icon: "🔍", label: "Model Route" },
        ].map((step, i) => (
          <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
            <circle cx={step.x} cy="110" r="25" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5"/>
            <text x={step.x} y="115" fill="white" fontSize="16" textAnchor="middle">{step.icon}</text>
            <text x={step.x} y="145" fill="#93c5fd" fontSize="9" textAnchor="middle">{step.label}</text>
            {i < 2 && <motion.line x1={step.x + 30} y1="110" x2={step.x + 70} y2="110" stroke="white" strokeWidth="1" strokeDasharray="3,3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.1 }}/>}
          </motion.g>
        ))}

        {/* Arrow Between Stages */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <motion.path d="M 400 90 L 500 90" fill="none" stroke="white" strokeWidth="3"
            markerEnd="url(#arrowhead)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}/>
          <motion.circle r="6" fill="#fbbf24"
            initial={{ cx: 400, cy: 90 }} animate={{ cx: [400, 500], cy: 90 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
          <text x="450" y="80" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">Data</text>
        </motion.g>

        {/* Stage 2 Box */}
        <motion.rect x="510" y="20" width="350" height="140" rx="16" fill="url(#stage2Grad)" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}/>
        <text x="685" y="45" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">STAGE 2: Extraction + Validation</text>
        <text x="685" y="62" fill="#86efac" fontSize="10" textAnchor="middle">NLP AI Processing</text>

        {/* Stage 2 Steps */}
        {[
          { x: 560, icon: "🔬", label: "Entity Extract" },
          { x: 660, icon: "✓", label: "Validation" },
          { x: 760, icon: "📊", label: "Confidence" },
        ].map((step, i) => (
          <motion.g key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
            <circle cx={step.x} cy="110" r="25" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.5"/>
            <text x={step.x} y="115" fill="white" fontSize="16" textAnchor="middle">{step.icon}</text>
            <text x={step.x} y="145" fill="#86efac" fontSize="9" textAnchor="middle">{step.label}</text>
            {i < 2 && <motion.line x1={step.x + 30} y1="110" x2={step.x + 70} y2="110" stroke="white" strokeWidth="1" strokeDasharray="3,3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 + i * 0.1 }}/>}
          </motion.g>
        ))}
      </svg>
    </motion.div>

    {/* Model Selection by Content Type */}
    <motion.div {...fadeInUp} className="bg-gray-50 rounded-xl p-5 border">
      <h4 className="font-bold text-foreground mb-4 text-center">Content-Aware Model Selection</h4>
      <div className="grid grid-cols-5 gap-3">
        {[
          { type: "📊 Tables", stage1: "Gemini Flash", stage2: "GPT-5", color: "blue" },
          { type: "✍️ Handwriting", stage1: "GPT-5 Vision", stage2: "GPT-5", color: "green" },
          { type: "🏥 Medical", stage1: "Claude Vision", stage2: "Claude Sonnet", color: "purple" },
          { type: "📋 Forms", stage1: "Gemini Pro", stage2: "Gemini Flash", color: "orange" },
          { type: "🖼️ Images", stage1: "GPT-5 Vision", stage2: "Gemini Pro", color: "cyan" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className={`text-center p-3 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}
          >
            <div className="text-lg mb-2">{item.type}</div>
            <div className={`text-xs font-medium text-${item.color}-700 mb-1`}>Stage 1</div>
            <div className="text-xs text-muted-foreground mb-2">{item.stage1}</div>
            <ArrowDown className={`w-4 h-4 mx-auto text-${item.color}-400 mb-2`} />
            <div className={`text-xs font-medium text-${item.color}-700 mb-1`}>Stage 2</div>
            <div className="text-xs text-muted-foreground">{item.stage2}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 7: SOLUTION ARCHITECTURE - Clear Visual Journey
// =============================================================================
const SolutionArchitectureSlide = () => (
  <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <Layers className="w-4 h-4 mr-2 inline" />
        How It Works: The Complete Journey
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">From document upload to actionable data in under 3 seconds</p>
    </motion.div>

    {/* Journey Steps - Horizontal Flow */}
    <motion.div {...fadeInUp} className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        {[
          { step: "1", icon: Upload, title: "Upload", desc: "Any format accepted", color: "blue" },
          { step: "2", icon: Eye, title: "Detect", desc: "AI identifies document", color: "purple" },
          { step: "3", icon: BrainCircuit, title: "Route", desc: "Best model selected", color: "violet" },
          { step: "4", icon: Cpu, title: "Extract", desc: "Vision + NLP processing", color: "green" },
          { step: "5", icon: CheckCircle, title: "Validate", desc: "Healthcare rules applied", color: "emerald" },
          { step: "6", icon: Send, title: "Deliver", desc: "Push to any system", color: "orange" },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center mb-2 shadow-lg relative`}>
                <item.icon className="w-7 h-7 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                  <span className="text-xs font-bold text-slate-800">{item.step}</span>
                </div>
              </div>
              <h5 className="text-white font-bold text-sm">{item.title}</h5>
              <p className="text-slate-400 text-xs">{item.desc}</p>
            </motion.div>
            {i < 5 && (
              <motion.div 
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    {/* Four Layer Architecture Cards */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { 
          layer: "Input Layer", 
          items: ["PDF", "Images", "Scans", "Fax"], 
          color: "blue",
          icon: Upload,
          desc: "Accept any document format"
        },
        { 
          layer: "Intelligence Layer", 
          items: ["Auto-Config", "Classification", "Routing"], 
          color: "purple",
          icon: BrainCircuit,
          desc: "AI-powered decision making"
        },
        { 
          layer: "Processing Layer", 
          items: ["Vision AI", "NLP Extraction", "Validation"], 
          color: "green",
          icon: Cpu,
          desc: "Multi-model extraction"
        },
        { 
          layer: "Output Layer", 
          items: ["JSON/FHIR", "EHR", "Webhooks", "MCP"], 
          color: "orange",
          icon: Send,
          desc: "Deliver to any system"
        },
      ].map((layer, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`bg-gradient-to-br from-${layer.color}-50 to-white rounded-xl p-4 border-2 border-${layer.color}-200 shadow-md`}
        >
          <div className={`w-10 h-10 bg-${layer.color}-100 rounded-lg flex items-center justify-center mb-2`}>
            <layer.icon className={`w-5 h-5 text-${layer.color}-600`} />
          </div>
          <h4 className={`font-bold text-${layer.color}-800 text-sm mb-1`}>{layer.layer}</h4>
          <p className="text-xs text-slate-600 mb-2">{layer.desc}</p>
          <div className="flex flex-wrap gap-1">
            {layer.items.map((item, j) => (
              <Badge key={j} variant="outline" className={`text-xs border-${layer.color}-300 text-${layer.color}-700`}>{item}</Badge>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Key Metrics */}
    <motion.div {...fadeInUp} className="grid grid-cols-4 gap-3">
      {[
        { icon: Zap, label: "Processing Time", value: "<3 sec", color: "blue", bg: "bg-blue-600" },
        { icon: Shield, label: "HIPAA Compliant", value: "100%", color: "green", bg: "bg-green-600" },
        { icon: Target, label: "Accuracy Rate", value: "95%+", color: "purple", bg: "bg-purple-600" },
        { icon: DollarSign, label: "Cost per Doc", value: "$0.05", color: "orange", bg: "bg-orange-600" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1 }}
          className={`text-center p-3 ${item.bg} rounded-xl shadow-lg`}
        >
          <item.icon className="w-6 h-6 text-white mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{item.value}</div>
          <div className="text-xs text-white/80">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 8: WHAT I BUILT - Current Implementation Features
// =============================================================================
const CurrentImplementationSlide = () => (
  <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <Rocket className="w-4 h-4 mr-2 inline" />
        What I Built: Production-Ready Platform
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">
        "I didn't just prototype — I built a complete, working system that's processing real healthcare documents today."
      </p>
    </motion.div>

    {/* Implementation Highlights Grid */}
    <div className="grid grid-cols-3 gap-4">
      {/* Core Processing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-blue-900">Multi-Model Processing</h4>
        </div>
        <div className="space-y-2">
          {[
            "Claude Sonnet 4 for medical context",
            "GPT-4o Vision for handwriting",
            "Gemini 2.5 Flash for tables",
            "Auto model selection",
            "Fallback routing"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <Badge className="mt-3 bg-blue-600 text-white">✓ Live</Badge>
      </motion.div>

      {/* Document Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border-2 border-purple-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-purple-900">Document Types</h4>
        </div>
        <div className="space-y-2">
          {[
            "Prescriptions & Rx forms",
            "Insurance cards",
            "Lab results & reports",
            "Medical records",
            "Prior authorizations",
            "Claims & EOBs"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <Badge className="mt-3 bg-purple-600 text-white">12+ Types</Badge>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-green-900">Live Integrations</h4>
        </div>
        <div className="space-y-2">
          {[
            "DrugBank API (drug lookup)",
            "RxNorm (medication codes)",
            "NDC Database",
            "FDA Drug Database",
            "Supabase (storage)"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <Badge className="mt-3 bg-green-600 text-white">5 APIs</Badge>
      </motion.div>
    </div>

    {/* Key Features Row */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-4 gap-3"
    >
      {[
        { icon: Eye, title: "Auto-Detection", desc: "Zero config document classification", color: "cyan" },
        { icon: PenTool, title: "Inline Editing", desc: "Edit extracted fields with drug lookup", color: "violet" },
        { icon: Shield, title: "Validation", desc: "Healthcare-specific field validation", color: "emerald" },
        { icon: Database, title: "Export", desc: "JSON, FHIR, CSV output formats", color: "orange" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className={`bg-${item.color}-50 border border-${item.color}-200 rounded-xl p-3 text-center`}
        >
          <item.icon className={`w-8 h-8 text-${item.color}-600 mx-auto mb-2`} />
          <h5 className={`font-bold text-${item.color}-800 text-sm`}>{item.title}</h5>
          <p className="text-xs text-slate-600">{item.desc}</p>
        </motion.div>
      ))}
    </motion.div>

    {/* Results Banner */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4"
    >
      <div className="grid grid-cols-4 gap-4 text-center text-white">
        {[
          { value: "95%+", label: "Extraction Accuracy" },
          { value: "<3s", label: "Processing Time" },
          { value: "12+", label: "Document Types" },
          { value: "5", label: "Drug Databases" },
        ].map((stat, i) => (
          <div key={i}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-emerald-100">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 10: GUIDED AGENT WORKFLOWS - Storytelling
// =============================================================================
const GuidedAgentWorkflowsSlide = () => (
  <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
        <Workflow className="w-4 h-4 mr-2 inline" />
        Guided Agent Workflows I Created
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">
        "Extraction is just step one. I built intelligent agents that take action on what they find."
      </p>
    </motion.div>

    {/* Workflow Cards */}
    <div className="grid grid-cols-3 gap-4">
      {[
        {
          title: "Insurance Card Verification",
          icon: Shield,
          steps: ["Extract card data", "Validate coverage", "Check eligibility", "Update patient record"],
          trigger: "Insurance card upload",
          result: "Verified coverage with eligibility status",
          color: "blue",
          status: "Ready"
        },
        {
          title: "Patient Onboarding",
          icon: Users,
          steps: ["Extract demographics", "Validate required fields", "Check existing records", "Create patient profile"],
          trigger: "New patient forms",
          result: "Complete patient profile in EHR",
          color: "green",
          status: "Ready"
        },
        {
          title: "Prescription Processing",
          icon: Pill,
          steps: ["Extract Rx details", "Drug interaction check", "Validate provider", "Queue for pharmacy"],
          trigger: "Prescription document",
          result: "Validated Rx ready for fulfillment",
          color: "purple",
          status: "Ready"
        },
      ].map((workflow, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={`bg-gradient-to-br from-${workflow.color}-50 to-white rounded-xl p-4 border-2 border-${workflow.color}-200 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 bg-${workflow.color}-600 rounded-lg flex items-center justify-center`}>
                <workflow.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className={`font-bold text-${workflow.color}-900 text-sm`}>{workflow.title}</h4>
            </div>
            <Badge className={`bg-${workflow.color}-600 text-white text-xs`}>{workflow.status}</Badge>
          </div>
          
          <div className="space-y-1.5 mb-3">
            {workflow.steps.map((step, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className={`w-5 h-5 bg-${workflow.color}-100 rounded-full flex items-center justify-center`}>
                  <span className={`text-xs font-bold text-${workflow.color}-700`}>{j + 1}</span>
                </div>
                <span className="text-xs text-slate-700">{step}</span>
              </div>
            ))}
          </div>

          <div className={`p-2 bg-${workflow.color}-100 rounded-lg`}>
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
              <Zap className="w-3 h-3" /> Trigger: {workflow.trigger}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
              <CheckCircle className="w-3 h-3 text-green-600" /> {workflow.result}
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Additional Workflows Row */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-2 gap-4"
    >
      {[
        {
          title: "Prior Authorization",
          icon: ClipboardList,
          description: "Auto-generate prior auth requests from clinical docs",
          steps: ["Extract clinical data", "Match to payer requirements", "Generate PA form", "Submit to payer"],
          color: "orange"
        },
        {
          title: "Lab Results Processing",
          icon: Activity,
          description: "Parse lab reports and flag abnormal values",
          steps: ["Extract lab values", "Apply reference ranges", "Flag abnormals", "Route to provider"],
          color: "cyan"
        },
      ].map((workflow, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className={`bg-gradient-to-r from-${workflow.color}-50 to-white rounded-xl p-4 border border-${workflow.color}-200 flex gap-4`}
        >
          <div className={`w-12 h-12 bg-${workflow.color}-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <workflow.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-${workflow.color}-900 mb-1`}>{workflow.title}</h4>
            <p className="text-xs text-slate-600 mb-2">{workflow.description}</p>
            <div className="flex flex-wrap gap-1">
              {workflow.steps.map((step, j) => (
                <Badge key={j} variant="outline" className={`text-xs border-${workflow.color}-300 text-${workflow.color}-700`}>
                  {j + 1}. {step}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>

    {/* Launch Options */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-violet-400" />
        <div>
          <h4 className="font-bold text-white">Execute workflows automatically or with human oversight</h4>
          <p className="text-sm text-slate-400">Agents can run autonomously or pause for approval at key steps</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Badge className="bg-violet-600 text-white">Auto Mode</Badge>
        <Badge className="bg-blue-600 text-white">Review Mode</Badge>
        <Badge className="bg-green-600 text-white">Hybrid</Badge>
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 9: CONFIGURATION & SETUP - Before workflows
// =============================================================================
const ConfigurationRequiredSlide = () => (
  <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <Wrench className="w-4 h-4 mr-2 inline" />
        How I Made It Easy to Deploy
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">
        "I designed this so you can start processing documents in under a minute — no complex setup, no configuration headaches."
      </p>
    </motion.div>

    <div className="grid grid-cols-2 gap-5">
      {/* Included - No Config Needed */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-green-900 text-lg">Included Out of the Box</h4>
            <p className="text-sm text-green-700">Zero configuration required</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {[
            { item: "Multi-model AI routing", desc: "Claude, GPT-4o, Gemini auto-selected" },
            { item: "Document classification", desc: "12+ healthcare document types" },
            { item: "Field extraction", desc: "Intelligent data parsing" },
            { item: "Drug database lookups", desc: "DrugBank, RxNorm, NDC, FDA" },
            { item: "Validation rules", desc: "Healthcare-specific field validation" },
            { item: "Export formats", desc: "JSON, FHIR R4, CSV" },
            { item: "Confidence scoring", desc: "Per-field accuracy metrics" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-2 p-2 bg-white rounded-lg"
            >
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-slate-900">{feature.item}</span>
                <p className="text-xs text-slate-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Configuration Options */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-300"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-lg">Optional Configuration</h4>
            <p className="text-sm text-amber-700">Customize for your workflow</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {[
            { item: "EHR Integration", desc: "Epic, Cerner, Allscripts endpoints", type: "API Keys" },
            { item: "Custom Document Types", desc: "Add organization-specific forms", type: "Template" },
            { item: "Workflow Rules", desc: "Define routing and approval logic", type: "Config" },
            { item: "MCP SDK Setup", desc: "Salesforce, HubSpot connections", type: "Auth" },
            { item: "Webhook Endpoints", desc: "n8n, Zapier, custom destinations", type: "URL" },
            { item: "Custom Validation", desc: "Organization-specific rules", type: "Rules" },
          ].map((config, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-start gap-2 p-2 bg-white rounded-lg"
            >
              <Wrench className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{config.item}</span>
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">{config.type}</Badge>
                </div>
                <p className="text-xs text-slate-600">{config.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Quick Start Guide */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4"
    >
      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-cyan-400" />
        Quick Start: 3 Steps to Production
      </h4>
      <div className="grid grid-cols-3 gap-4">
        {[
          { step: "1", title: "Upload Document", desc: "Drop any healthcare document", time: "5 sec" },
          { step: "2", title: "Review Extraction", desc: "Verify AI-extracted fields", time: "30 sec" },
          { step: "3", title: "Export or Push", desc: "Send to your systems", time: "5 sec" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="bg-white/5 rounded-lg p-3 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{item.step}</span>
              </div>
              <Badge className="bg-green-600/20 text-green-300 text-xs">{item.time}</Badge>
            </div>
            <h5 className="font-bold text-white text-sm">{item.title}</h5>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 11: SUB-AGENTS - Ready Agents and Canvas (after Guided Workflows)
// =============================================================================
const SubAgentSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
        <Bot className="w-4 h-4 mr-2 inline" />
        Sub-Agents I Built for Specialized Tasks
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">
        "Each agent is a specialist. Together on the canvas, they become a powerful orchestrated team."
      </p>
    </motion.div>

    {/* Agent Orchestration Flow */}
    <motion.div
      {...fadeInUp}
      className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 rounded-2xl p-6"
    >
      <h4 className="text-white font-bold text-center mb-4">AI Agent Orchestration Canvas</h4>
      
      <div className="flex items-center justify-between">
        {[
          { icon: FileCheck, label: "Document\nProcessed", status: "complete" },
          { icon: BrainCircuit, label: "AI\nAnalysis", status: "complete" },
          { icon: Lightbulb, label: "Agent\nRecommendation", status: "active" },
          { icon: Workflow, label: "Launch on\nCanvas", status: "pending" },
          { icon: Rocket, label: "Execute\nNow", status: "pending" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              className="flex flex-col items-center text-center relative"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, type: "spring" }}
            >
              {step.status === "active" && (
                <motion.div
                  className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-2 border-2",
                step.status === "complete" ? "bg-green-500/20 border-green-400" :
                step.status === "active" ? "bg-yellow-500/20 border-yellow-400" :
                "bg-gray-500/20 border-gray-400"
              )}>
                <step.icon className={cn(
                  "w-7 h-7",
                  step.status === "complete" ? "text-green-400" :
                  step.status === "active" ? "text-yellow-400" :
                  "text-gray-400"
                )} />
              </div>
              <span className="text-xs font-medium text-white whitespace-pre-line">{step.label}</span>
            </motion.div>
            {i < 4 && <AnimatedConnection delay={i * 0.2} />}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    {/* Ready Agents Grid */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { 
          name: "Prior Auth Agent",
          desc: "Auto-submit prior authorization",
          status: "Ready",
          actions: ["Check PA requirements", "Submit to payer"],
          icon: ClipboardList,
          color: "blue"
        },
        { 
          name: "EHR Integration Agent",
          desc: "Push to Epic/Cerner/Allscripts",
          status: "Ready",
          actions: ["Map to EHR schema", "Validate & push"],
          icon: Stethoscope,
          color: "green"
        },
        { 
          name: "Drug Interaction Agent",
          desc: "Check medication interactions",
          status: "Ready",
          actions: ["Query DrugBank", "Alert on conflicts"],
          icon: Pill,
          color: "orange"
        },
        { 
          name: "Scheduling Agent",
          desc: "Book follow-up appointments",
          status: "Configure",
          actions: ["Parse dates", "Check availability"],
          icon: Clock,
          color: "purple"
        },
      ].map((agent, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`bg-gradient-to-br from-${agent.color}-50 to-white rounded-xl p-4 border border-${agent.color}-200`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 bg-${agent.color}-100 rounded-lg flex items-center justify-center`}>
              <agent.icon className={`w-4 h-4 text-${agent.color}-600`} />
            </div>
            <Badge className={agent.status === "Ready" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
              {agent.status}
            </Badge>
          </div>
          
          <h4 className="font-bold text-sm text-foreground mb-1">{agent.name}</h4>
          <p className="text-xs text-muted-foreground mb-2">{agent.desc}</p>
          
          <div className="space-y-1 mb-3">
            {agent.actions.map((action, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full bg-${agent.color}-400`} />
                <span className="text-foreground">{action}</span>
              </div>
            ))}
          </div>
          
          <Button size="sm" className={`w-full gap-1 ${agent.status === "Ready" ? `bg-${agent.color}-500 hover:bg-${agent.color}-600` : "bg-gray-400"}`}>
            {agent.status === "Ready" ? <><Rocket className="w-3 h-3" /> Execute</> : <><Wrench className="w-3 h-3" /> Configure</>}
          </Button>
        </motion.div>
      ))}
    </div>

    {/* Agent Types */}
    <motion.div {...fadeInUp} className="grid grid-cols-5 gap-2">
      {[
        { type: "Single Agent", desc: "One task focus", icon: Bot },
        { type: "Agentic AI", desc: "Autonomous decisions", icon: BrainCircuit },
        { type: "A2A Protocol", desc: "Agent-to-Agent", icon: Network },
        { type: "Clinical Agent", desc: "Healthcare specific", icon: Stethoscope },
        { type: "Multi-Agent", desc: "Orchestrated team", icon: Users },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.05 }}
          className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200"
        >
          <item.icon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <div className="text-xs font-bold text-foreground">{item.type}</div>
          <div className="text-xs text-muted-foreground">{item.desc}</div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 10: EXTERNAL DATA PUSH - MCP SDK, Integrations
// =============================================================================
const ExternalPushSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <Send className="w-4 h-4 mr-2 inline" />
        External Data Push & MCP SDK
      </Badge>
    </motion.div>

    {/* Integration Methods */}
    <div className="grid grid-cols-4 gap-4">
      {[
        { method: "MCP SDK", desc: "Model Context Protocol for AI agents", icon: Package, targets: ["Salesforce", "HubSpot", "Custom CRM"], color: "purple" },
        { method: "REST API", desc: "Direct API integration", icon: Server, targets: ["Epic", "Cerner", "Allscripts"], color: "blue" },
        { method: "HL7/FHIR", desc: "Healthcare standards", icon: HeartPulse, targets: ["Change Health", "CMS", "Payers"], color: "green" },
        { method: "Webhooks", desc: "Real-time event push", icon: Zap, targets: ["n8n", "Zapier", "Custom"], color: "orange" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className={`bg-gradient-to-br from-${item.color}-50 to-white rounded-xl p-4 border border-${item.color}-200`}
        >
          <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-3`}>
            <item.icon className={`w-5 h-5 text-${item.color}-600`} />
          </div>
          <h4 className="font-bold text-foreground mb-1">{item.method}</h4>
          <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
          <div className="flex flex-wrap gap-1">
            {item.targets.map((target, j) => (
              <Badge key={j} variant="outline" className="text-xs">{target}</Badge>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Healthcare Integrations */}
    <motion.div {...fadeInUp} className="bg-gradient-to-r from-teal-900 via-cyan-900 to-blue-900 rounded-xl p-5">
      <h4 className="text-white font-bold mb-4">Healthcare System Integrations</h4>
      <div className="grid grid-cols-6 gap-3">
        {[
          { name: "Change Health", type: "Clearinghouse" },
          { name: "FDA NDC", type: "Drug Codes" },
          { name: "ICD-10", type: "Diagnosis" },
          { name: "CPT", type: "Procedures" },
          { name: "NPI Registry", type: "Providers" },
          { name: "CMS", type: "Medicare" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="text-center p-3 bg-white/10 rounded-lg border border-white/20"
          >
            <div className="text-white font-bold text-sm">{item.name}</div>
            <div className="text-cyan-300 text-xs">{item.type}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Export Formats */}
    <motion.div {...fadeInUp} className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-xl p-4 border">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-green-500" />
          Export Formats
        </h4>
        <div className="flex flex-wrap gap-2">
          {["JSON", "FHIR R4", "HL7 v2", "CSV", "XML", "PDF Report"].map((format, i) => (
            <Badge key={i} className="bg-green-100 text-green-700">{format}</Badge>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 border">
        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Data Destinations
        </h4>
        <div className="flex flex-wrap gap-2">
          {["Supabase", "PostgreSQL", "MongoDB", "S3", "BigQuery", "Snowflake"].map((dest, i) => (
            <Badge key={i} className="bg-blue-100 text-blue-700">{dest}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 13: ROI - How I Built This So Fast
// =============================================================================
const ROISlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <BarChart3 className="w-4 h-4 mr-2 inline" />
        How I Built This So Fast
      </Badge>
      <p className="text-sm text-muted-foreground mt-2">
        "What would take a traditional team 6-9 months, I built in weeks. Here's the proof."
      </p>
    </motion.div>

    <div className="grid grid-cols-2 gap-6">
      {/* Traditional Team */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-red-700">Traditional Development</h4>
          <Badge variant="destructive">High Cost</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <h5 className="font-semibold text-foreground text-sm">Team Required:</h5>
          {[
            { role: "Business Analyst", count: 1, rate: "$80/hr", location: "Onsite" },
            { role: "Solution Architect", count: 1, rate: "$120/hr", location: "Onsite" },
            { role: "Frontend Developers", count: 2, rate: "$70/hr", location: "Offshore" },
            { role: "Backend Developers", count: 2, rate: "$75/hr", location: "Offshore" },
            { role: "Server-side Engineers", count: 2, rate: "$80/hr", location: "Mixed" },
            { role: "QA Testers", count: 2, rate: "$50/hr", location: "Offshore" },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between p-2 bg-white rounded-lg text-sm"
            >
              <span className="text-foreground">{member.count}x {member.role}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{member.location}</Badge>
                <span className="text-muted-foreground">{member.rate}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">10 People</div>
            <div className="text-xs text-red-600">Team Size</div>
          </div>
          <div className="p-3 bg-red-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">6-9 Months</div>
            <div className="text-xs text-red-600">Timeline</div>
          </div>
          <div className="p-3 bg-red-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">$350K+</div>
            <div className="text-xs text-red-600">Total Cost</div>
          </div>
          <div className="p-3 bg-red-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">High</div>
            <div className="text-xs text-red-600">Risk Level</div>
          </div>
        </div>
      </motion.div>

      {/* Lovable Approach */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-green-700 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            How I Did It
          </h4>
          <Badge className="bg-green-500 text-white">99% Savings</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <h5 className="font-semibold text-foreground text-sm">What I Used:</h5>
          {[
            { item: "Lovable AI Platform", detail: "My development partner", cost: "$200/mo" },
            { item: "AI Processing Credits", detail: "Document processing", cost: "$500" },
            { item: "Supabase Backend", detail: "Database & auth", cost: "$25/mo" },
            { item: "My Domain Knowledge", detail: "Healthcare expertise", cost: "My time" },
          ].map((resource, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center justify-between p-2 bg-white rounded-lg text-sm"
            >
              <div>
                <span className="text-foreground font-medium">{resource.item}</span>
                <div className="text-xs text-muted-foreground">{resource.detail}</div>
              </div>
              <Badge className="bg-green-100 text-green-700">{resource.cost}</Badge>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">Just Me</div>
            <div className="text-xs text-green-600">Team Size</div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">2-4 Weeks</div>
            <div className="text-xs text-green-600">Timeline</div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">$2,500</div>
            <div className="text-xs text-green-600">Total Cost</div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">Low</div>
            <div className="text-xs text-green-600">Risk Level</div>
          </div>
        </div>
      </motion.div>
    </div>

    {/* ROI Summary */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center"
    >
      <h4 className="text-2xl font-bold mb-4">Return on Investment</h4>
      <div className="grid grid-cols-4 gap-4">
        {[
          { metric: "Cost Savings", value: "99%", detail: "$350K → $2.5K" },
          { metric: "Time Savings", value: "95%", detail: "9 months → 3 weeks" },
          { metric: "Team Reduction", value: "90%", detail: "10 people → 1 person" },
          { metric: "Time to Value", value: "50x", detail: "Faster deployment" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
            className="bg-white/10 rounded-xl p-4"
          >
            <div className="text-3xl font-bold text-white">{item.value}</div>
            <div className="text-sm text-green-100">{item.metric}</div>
            <div className="text-xs text-green-200">{item.detail}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 14: THANK YOU & CONTACT - Learn More
// =============================================================================
const ThankYouContactSlide = () => (
  <motion.div className="space-y-4 flex flex-col items-center justify-center" variants={staggerContainer} initial="initial" animate="animate">
    {/* Thank You Header with Amazement Message */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-5xl mb-3"
      >
        🙏
      </motion.div>
      <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
      <p className="text-base text-indigo-200 max-w-2xl">
        I am <span className="text-purple-400 font-bold">amazed</span> at how tools like <span className="text-purple-400 font-bold">Lovable</span> can bring a 
        <span className="text-amber-400 font-bold"> big shift in the mindset</span> of development — 
        what's possible is now <span className="text-emerald-400 font-bold">beyond imagination</span>.
      </p>
    </motion.div>

    {/* Key Takeaways - Compact */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border border-indigo-500/30 max-w-2xl w-full"
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { emoji: "🚀", text: "AI is democratizing development" },
          { emoji: "💡", text: "Build in weeks, not months" },
          { emoji: "🎯", text: "Anyone can create magic" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-2 bg-slate-900/50 rounded-lg"
          >
            <div className="text-xl mb-1">{item.emoji}</div>
            <p className="text-xs text-slate-300">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Video & Links Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-2 gap-4 max-w-3xl w-full"
    >
      {/* Watch Demo Video */}
      <a 
        href="https://lnkd.in/eWxn_gQw" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-600/20 via-red-500/10 to-orange-600/20 rounded-xl p-4 border border-red-500/40 h-full cursor-pointer hover:border-red-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Watch the Demo</h4>
              <p className="text-xs text-red-300">See it in action</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Click to watch the video walkthrough</p>
        </motion.div>
      </a>

      {/* Newsletter Subscription */}
      <a 
        href="https://www.linkedin.com/newsletters/genie-ai-hub-7379711554889601024/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20 rounded-xl p-4 border border-blue-500/40 h-full cursor-pointer hover:border-blue-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Subscribe to Newsletter</h4>
              <p className="text-xs text-blue-300">Genie AI Hub on LinkedIn</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Get updates on AI development tips</p>
        </motion.div>
      </a>
    </motion.div>

    {/* Contact Information */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/40 max-w-xl w-full"
    >
      <h3 className="text-sm font-semibold text-white mb-3 text-center">
        Want to Learn More? Let's Connect!
      </h3>
      <div className="flex items-center justify-center gap-3">
        <motion.a
          href="mailto:dasikasaigiridhar@gmail.com"
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20 hover:border-purple-400/50 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-300">Email me</p>
            <p className="text-sm font-bold text-purple-300">dasikasaigiridhar@gmail.com</p>
          </div>
        </motion.a>
      </div>
    </motion.div>

    {/* Built With */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="flex items-center gap-2 text-slate-400"
    >
      <span className="text-xs">Built with</span>
      <span className="text-purple-400 font-semibold text-sm">❤️ + Lovable AI</span>
      <span className="text-xs">in less than a week</span>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDES ARRAY
// =============================================================================
const documentProcessingSlides: Slide[] = [
  { 
    id: 0, 
    title: "My Journey", 
    subtitle: "AI is democratizing development",
    animation: 'fade', 
    content: <IntroSlide />,
    pptContent: {
      bullets: [
        "For a long time, I watched healthcare teams struggle with documents",
        "Companies paying heavy money to partners for solutions that don't work well",
        "With new AI tools like Lovable, I knew I could build something better",
        "This whole thing was built in less than a week — production ready",
        "AI is democratizing development — this is my story"
      ],
      notes: "Opening slide that sets the narrative tone — how AI tools are enabling individuals to build what used to require entire teams."
    }
  },
  { 
    id: 1, 
    title: "Healthcare Document Crisis", 
    subtitle: "The problem I've been seeing for years",
    animation: 'fade', 
    content: <ProblemStatementSlide />,
    pptContent: {
      bullets: [
        "4+ hours per day spent on manual data entry",
        "$15-50 cost per document processed manually",
        "15-30% error rates in manual extraction",
        "High staff turnover due to repetitive tasks",
        "Companies keep paying heavy money to partners",
        "I knew AI could change this — so I built something myself"
      ],
      notes: "Healthcare organizations waste millions annually on manual document processing — I saw this repeatedly and knew there had to be a better way."
    }
  },
  { 
    id: 2, 
    title: "My Learnings & Experimentation", 
    subtitle: "What I discovered about existing approaches",
    animation: 'slide', 
    content: <CurrentToolsSlide />,
    pptContent: {
      bullets: [
        "Traditional OCR: Template-based, 60-70% accuracy, no context understanding",
        "Rule-Based Systems: Hard-coded, breaks with format changes, 100+ hrs/month maintenance",
        "Single AI Model: One-size-fits-all, poor on specialized docs, 3-5x higher costs",
        "1:1 Mapping Problem: Manual configuration for each document type",
        "No adaptability to new document formats",
        "High implementation and maintenance costs"
      ],
      notes: "Traditional tools require manual configuration for each document type, creating maintenance nightmares and failing when documents don't match expected formats."
    }
  },
  { 
    id: 3, 
    title: "The AI-Powered Transformation", 
    subtitle: "How AI benefits the document processing workflow",
    animation: 'zoom', 
    content: <AITransformationSlide />,
    pptContent: {
      bullets: [
        "Before: 46 minutes per document with manual process",
        "After: 37 seconds per document with AI",
        "75x faster processing speed",
        "95%+ accuracy rate vs 70% manual",
        "90% cost reduction",
        "10x staff efficiency improvement"
      ],
      notes: "AI transforms document processing from a 46-minute manual ordeal to a 37-second automated workflow with higher accuracy."
    }
  },
  { 
    id: 4, 
    title: "Intelligent Multi-Model Routing", 
    subtitle: "The right AI model for each document type",
    animation: 'slide', 
    content: <WhyMultiModelSlide />,
    pptContent: {
      bullets: [
        "Claude Sonnet 4: Medical records, complex forms (98% accuracy)",
        "GPT-5 Vision: Handwritten prescriptions, signatures (96% accuracy)",
        "Gemini 2.5 Flash: Lab results, tables, structured data (97% accuracy)",
        "Gemini 2.5 Pro: Medical images, X-rays, DICOM (95% accuracy)",
        "AI Router: Intelligent selection based on document content",
        "Auto-Configuration: Zero manual setup required"
      ],
      notes: "Multi-model routing automatically selects the optimal AI model based on document content analysis, maximizing accuracy while minimizing costs."
    }
  },
  { 
    id: 5, 
    title: "Zero Configuration Auto-Detection", 
    subtitle: "Intelligent document type recognition",
    animation: 'fade', 
    content: <DocumentConfigSlide />,
    pptContent: {
      bullets: [
        "Upload any document format (PDF, images, scans, photos)",
        "Automatic document type detection with 96%+ confidence",
        "Auto-detection of handwriting, tables, signatures, letterheads",
        "Automatic field mapping based on document type",
        "Optimal model routing determined automatically",
        "Zero manual configuration required"
      ],
      notes: "The auto-detection pipeline analyzes uploaded documents and automatically configures the optimal extraction workflow."
    }
  },
  { 
    id: 6, 
    title: "Two-Stage Pipeline Architecture", 
    subtitle: "Vision AI + NLP for maximum accuracy",
    animation: 'slide', 
    content: <TwoStagePipelineSlide />,
    pptContent: {
      bullets: [
        "Stage 1: Classification + OCR (Vision AI Processing)",
        "- Visual analysis, text extraction, model routing",
        "Stage 2: Entity Extraction + Validation (NLP AI Processing)",
        "- Structured data extraction, healthcare validation, confidence scoring",
        "Content-aware model selection for each stage",
        "Optimized for tables, handwriting, medical docs, forms, images"
      ],
      notes: "The two-stage pipeline separates visual analysis from entity extraction, allowing specialized models to handle each phase optimally."
    }
  },
  { 
    id: 7, 
    title: "Complete Solution Architecture", 
    subtitle: "End-to-end document processing platform",
    animation: 'zoom', 
    content: <SolutionArchitectureSlide />,
    pptContent: {
      bullets: [
        "Input Layer: PDF, Images, Scans, Photos, Fax",
        "Intelligence Layer: Auto-Config, Classification, Routing, Optimization",
        "Processing Layer: Vision AI, NLP Extraction, Validation, Confidence",
        "Output Layer: JSON/FHIR, EHR Systems, Webhooks, MCP SDK, Supabase",
        "Processing time: <3 seconds per document",
        "100% HIPAA compliant, 95%+ accuracy, $0.05 per document"
      ],
      notes: "The four-layer architecture provides a complete solution from document ingestion to data delivery with healthcare compliance."
    }
  },
  { 
    id: 8, 
    title: "What I Built", 
    subtitle: "A complete production-ready platform",
    animation: 'fade', 
    content: <CurrentImplementationSlide />,
    pptContent: {
      bullets: [
        "Multi-model AI: Claude Sonnet 4, GPT-4o Vision, Gemini 2.5 Flash",
        "12+ document types: Prescriptions, insurance cards, lab results, medical records",
        "Live integrations: DrugBank, RxNorm, NDC, FDA databases",
        "Auto-detection with zero configuration",
        "Inline editing with drug lookup",
        "Export: JSON, FHIR R4, CSV formats"
      ],
      notes: "I built this complete system that's processing real healthcare documents today with 95%+ accuracy."
    }
  },
  { 
    id: 9, 
    title: "How I Made It Easy to Deploy", 
    subtitle: "Zero configuration, instant results",
    animation: 'zoom', 
    content: <ConfigurationRequiredSlide />,
    pptContent: {
      bullets: [
        "Included: Multi-model routing, document classification, field extraction",
        "Included: Drug database lookups, validation rules, export formats",
        "Optional: EHR integration (Epic, Cerner, Allscripts)",
        "Optional: Custom document types and workflow rules",
        "Optional: MCP SDK for Salesforce, HubSpot connections",
        "Quick Start: 3 steps to production in under 1 minute"
      ],
      notes: "I designed this for simplicity — start processing in under a minute with no configuration headaches."
    }
  },
  { 
    id: 10, 
    title: "Guided Agent Workflows I Created", 
    subtitle: "From extraction to automated action",
    animation: 'slide', 
    content: <GuidedAgentWorkflowsSlide />,
    pptContent: {
      bullets: [
        "Insurance Card Verification: Extract, validate coverage, check eligibility",
        "Patient Onboarding: Demographics extraction to EHR profile creation",
        "Prescription Processing: Rx extraction with drug interaction checks",
        "Prior Authorization: Auto-generate PA requests from clinical docs",
        "Lab Results Processing: Parse reports, flag abnormal values",
        "Execute automatically or with human oversight"
      ],
      notes: "Extraction is just step one. I built intelligent agents that take action on what they find."
    }
  },
  { 
    id: 11, 
    title: "Sub-Agents I Built for Specialized Tasks", 
    subtitle: "Specialist agents working together",
    animation: 'slide', 
    content: <SubAgentSlide />,
    pptContent: {
      bullets: [
        "Prior Auth Agent: Auto-submit prior authorization (Ready)",
        "EHR Integration Agent: Push to Epic/Cerner (Ready)",
        "Drug Interaction Agent: Check medication conflicts (Ready)",
        "Scheduling Agent: Book follow-ups (Configurable)",
        "Agent types: Single Agent, Agentic AI, A2A, Clinical, Multi-Agent",
        "Launch on Canvas or Execute Now options"
      ],
      notes: "Each agent is a specialist. Together on the canvas, they become a powerful orchestrated team."
    }
  },
  { 
    id: 12, 
    title: "External Data Push & Integrations", 
    subtitle: "MCP SDK, REST API, FHIR, and more",
    animation: 'zoom', 
    content: <ExternalPushSlide />,
    pptContent: {
      bullets: [
        "MCP SDK: Salesforce, HubSpot, Custom CRM integration",
        "REST API: Epic, Cerner, Allscripts EHR systems",
        "HL7/FHIR: Change Health, CMS, Payer systems",
        "Webhooks: n8n, Zapier, custom automation",
        "Healthcare integrations: FDA NDC, ICD-10, CPT, NPI Registry",
        "Export formats: JSON, FHIR R4, HL7 v2, CSV, XML, PDF"
      ],
      notes: "Comprehensive integration capabilities for pushing extracted data to any external system using industry-standard protocols."
    }
  },
  { 
    id: 13, 
    title: "How I Built This So Fast", 
    subtitle: "Lovable vs Traditional Development",
    animation: 'fade', 
    content: <ROISlide />,
    pptContent: {
      bullets: [
        "Traditional: 10-person team (BA, Architect, 4 Devs, 2 Server, 2 QA)",
        "Traditional: 6-9 months timeline, $350K+ cost, high risk",
        "How I did it: 1 person + Lovable AI platform",
        "My timeline: 2-4 weeks, $2,500 total cost, low risk",
        "ROI: 99% cost savings, 95% time savings, 90% team reduction",
        "50x faster time to value — proof that AI-assisted development works"
      ],
      notes: "This is how I built a complete enterprise platform in weeks instead of months — Lovable AI made it possible."
    }
  },
  { 
    id: 14, 
    title: "Thank You!", 
    subtitle: "Let's Connect & Stay Updated",
    animation: 'fade', 
    content: <ThankYouContactSlide />,
    pptContent: {
      bullets: [
        "I am amazed at how tools like Lovable bring a big shift in the mindset of development",
        "What's possible is now beyond imagination",
        "Watch the demo: https://lnkd.in/eWxn_gQw",
        "Subscribe to Genie AI Hub Newsletter: linkedin.com/newsletters/genie-ai-hub",
        "Contact: dasikasaigiridhar@gmail.com",
        "Built with ❤️ + Lovable AI in less than a week"
      ],
      notes: "Thank you for exploring this journey. I am amazed at how tools like Lovable can bring a big shift in the mindset of development. Contact dasikasaigiridhar@gmail.com to learn more."
    }
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
interface DocumentProcessingPresentationProps {
  onExit?: () => void;
  isPublicView?: boolean;
}

// Get public presentation URL - use production domain for sharing
const getPublicPresentationUrl = () => {
  // Use production domain for social sharing
  return 'https://genieaiexpermentationhub.com/public/presentation/document-processing';
};

// Get static share page URL (has proper OG meta tags for LinkedIn)
const getSharePageUrl = () => {
  return 'https://genieaiexpermentationhub.com/share/document-processing.html';
};

export const DocumentProcessingPresentation: React.FC<DocumentProcessingPresentationProps> = ({ onExit, isPublicView = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % documentProcessingSlides.length);
      }, 12000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % documentProcessingSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + documentProcessingSlides.length) % documentProcessingSlides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const downloadPPT = async () => {
    try {
      toast.info('Generating PowerPoint with full content...', {
        description: 'This may take a few seconds'
      });
      
      const pptx = new pptxgen();
      pptx.title = 'Document Processing Platform - Multi-Model AI';
      pptx.author = 'Genie AI / Lovable';
      pptx.subject = 'Intelligent Document Processing with Multi-Model Routing';
      pptx.company = 'Genie AI';
      
      // Define consistent colors
      const colors = {
        primary: '8b5cf6',
        secondary: '3b82f6',
        dark: '1e293b',
        muted: '64748b',
        light: '94a3b8',
        success: '22c55e',
        warning: 'f59e0b',
        danger: 'ef4444'
      };
      
      // Title slide with gradient background
      const titleSlide = pptx.addSlide();
      titleSlide.addShape('rect', {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { type: 'solid', color: '0f172a' }
      });
      titleSlide.addText('Document Processing Platform', { 
        x: 0.5, y: 1.8, w: '90%', h: 1,
        fontSize: 44, bold: true, color: 'ffffff',
        align: 'center', fontFace: 'Arial'
      });
      titleSlide.addText('Multi-Model AI for Intelligent Document Extraction', {
        x: 0.5, y: 3, w: '90%', h: 0.5,
        fontSize: 22, color: 'a78bfa',
        align: 'center', fontFace: 'Arial'
      });
      titleSlide.addText('95%+ Accuracy • 75x Faster • 99% Cost Reduction', {
        x: 0.5, y: 3.7, w: '90%', h: 0.4,
        fontSize: 16, color: '22c55e',
        align: 'center', fontFace: 'Arial', bold: true
      });
      titleSlide.addText('Powered by Genie AI & Lovable', {
        x: 0.5, y: 4.8, w: '90%', h: 0.3,
        fontSize: 14, color: '8b5cf6',
        align: 'center', fontFace: 'Arial', italic: true
      });
      
      // Content slides with enhanced formatting
      documentProcessingSlides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // Header background
        pptSlide.addShape('rect', {
          x: 0, y: 0, w: '100%', h: 1.3,
          fill: { type: 'solid', color: 'f8fafc' }
        });
        
        // Slide number badge
        pptSlide.addShape('rect', {
          x: 8.8, y: 0.15, w: 0.8, h: 0.35,
          fill: { type: 'solid', color: colors.primary }
        });
        pptSlide.addText(`${index + 1}/${documentProcessingSlides.length}`, {
          x: 8.8, y: 0.15, w: 0.8, h: 0.35,
          fontSize: 10, color: 'ffffff', align: 'center', valign: 'middle'
        });
        
        // Title
        pptSlide.addText(slide.title, {
          x: 0.5, y: 0.25, w: '80%', h: 0.6,
          fontSize: 28, bold: true, color: colors.dark,
          fontFace: 'Arial'
        });
        
        // Subtitle
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, {
            x: 0.5, y: 0.85, w: '80%', h: 0.35,
            fontSize: 14, color: colors.muted,
            fontFace: 'Arial'
          });
        }
        
        // Content bullets with enhanced styling
        if (slide.pptContent?.bullets) {
          slide.pptContent.bullets.forEach((bullet, bulletIndex) => {
            const isSubItem = bullet.startsWith('-');
            const cleanBullet = isSubItem ? bullet.substring(2) : bullet;
            const yPos = 1.6 + (bulletIndex * 0.55);
            const xPos = isSubItem ? 0.9 : 0.5;
            const bulletColor = isSubItem ? colors.muted : colors.dark;
            const bulletIcon = isSubItem ? '  →' : '•';
            
            pptSlide.addText(`${bulletIcon}  ${cleanBullet}`, {
              x: xPos, y: yPos, w: '85%', h: 0.5,
              fontSize: isSubItem ? 14 : 16, 
              color: bulletColor,
              fontFace: 'Arial',
              valign: 'top'
            });
          });
        }
        
        // Speaker notes
        if (slide.pptContent?.notes) {
          pptSlide.addNotes(slide.pptContent.notes);
        }
        
        // Footer
        pptSlide.addText('genieaiexpermentationhub.com', {
          x: 0.5, y: 5.2, w: 3, h: 0.25,
          fontSize: 9, color: colors.light, fontFace: 'Arial'
        });
      });
      
      // Summary slide with enhanced styling
      const summarySlide = pptx.addSlide();
      summarySlide.addShape('rect', {
        x: 0, y: 0, w: '100%', h: 1.2,
        fill: { type: 'solid', color: '0f172a' }
      });
      summarySlide.addText('Key Takeaways', {
        x: 0.5, y: 0.35, w: '90%', h: 0.6,
        fontSize: 32, bold: true, color: 'ffffff',
        fontFace: 'Arial'
      });
      
      const summaryBullets = [
        { text: '✓  Multi-model routing achieves 95%+ accuracy\n', options: { fontSize: 16, color: colors.dark } },
        { text: '✓  Zero-configuration auto-detection for any document\n', options: { fontSize: 16, color: colors.dark } },
        { text: '✓  Two-stage pipeline: Vision AI + NLP processing\n', options: { fontSize: 16, color: colors.dark } },
        { text: '✓  Drug integrations: DrugBank, RxNorm, NDC, FDA\n', options: { fontSize: 16, color: colors.dark } },
        { text: '✓  Ready agents for Prior Auth, EHR, Drug Checks\n', options: { fontSize: 16, color: colors.dark } },
        { text: '✓  MCP SDK for Salesforce, HubSpot integration\n', options: { fontSize: 16, color: colors.dark } },
        { text: '\n', options: { fontSize: 8 } },
        { text: '★  99% cost reduction: $350K → $2,500\n', options: { fontSize: 18, color: colors.success, bold: true } },
        { text: '★  95% time reduction: 9 months → 3 weeks\n', options: { fontSize: 18, color: colors.success, bold: true } },
      ];
      
      summarySlide.addText(summaryBullets, {
        x: 0.5, y: 1.5, w: '90%', h: 3.5,
        fontFace: 'Arial', valign: 'top'
      });
      
      // Contact/CTA slide with dark background
      const ctaSlide = pptx.addSlide();
      ctaSlide.addShape('rect', {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { type: 'solid', color: '0f172a' }
      });
      ctaSlide.addText('Ready to Transform Your', {
        x: 0.5, y: 1.5, w: '90%', h: 0.6,
        fontSize: 32, color: 'ffffff',
        align: 'center', fontFace: 'Arial'
      });
      ctaSlide.addText('Document Processing?', {
        x: 0.5, y: 2.1, w: '90%', h: 0.8,
        fontSize: 40, bold: true, color: 'a78bfa',
        align: 'center', fontFace: 'Arial'
      });
      ctaSlide.addText('Experience the power of Multi-Model AI', {
        x: 0.5, y: 3.2, w: '90%', h: 0.5,
        fontSize: 18, color: '94a3b8',
        align: 'center', fontFace: 'Arial'
      });
      ctaSlide.addText('🌐 genieaiexpermentationhub.com', {
        x: 0.5, y: 4, w: '90%', h: 0.4,
        fontSize: 18, color: '3b82f6',
        align: 'center', fontFace: 'Arial', 
        hyperlink: { url: 'https://genieaiexpermentationhub.com' }
      });
      ctaSlide.addText('Built with Lovable AI', {
        x: 0.5, y: 4.7, w: '90%', h: 0.3,
        fontSize: 12, color: '64748b',
        align: 'center', fontFace: 'Arial', italic: true
      });
      
      await pptx.writeFile({ fileName: 'document-processing-platform.pptx' });
      toast.success('✅ PowerPoint downloaded!', {
        description: `${documentProcessingSlides.length + 3} slides with full content`
      });
    } catch (error) {
      console.error('PPT generation error:', error);
      toast.error('Failed to generate PowerPoint');
    }
  };

  // Download as PDF - captures exact visual appearance of all slides
  const downloadPDF = async () => {
    toast.info('📄 Generating PDF with all slides...', {
      description: 'Please wait while we capture each slide'
    });

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720]
      });

      const originalSlide = currentSlide;
      const wasAutoplay = isAutoplay;
      setIsAutoplay(false); // Pause autoplay during capture

      for (let i = 0; i < documentProcessingSlides.length; i++) {
        setCurrentSlide(i);
        // Wait longer for animation to complete and content to render
        await new Promise(resolve => setTimeout(resolve, 800));

        // Target the inner slide content, not the animated container
        const slideElement = document.querySelector('[data-slide-inner]') as HTMLElement;
        if (!slideElement) {
          console.warn(`Could not find slide content for slide ${i + 1}`);
          continue;
        }

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f172a',
          logging: false,
          windowWidth: 1280,
          windowHeight: 720,
          onclone: (clonedDoc) => {
            // Ensure all text is visible in cloned document
            const clonedElement = clonedDoc.querySelector('[data-slide-inner]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.transform = 'none';
              clonedElement.style.opacity = '1';
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape');
        }
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      // Restore original state
      setCurrentSlide(originalSlide);
      if (wasAutoplay) setIsAutoplay(true);

      pdf.save('document-processing-presentation.pdf');
      toast.success('✅ PDF downloaded!', {
        description: `${documentProcessingSlides.length} slides saved`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Download as PNG images - captures exact visual of current slide or all slides
  const downloadAsImages = async (allSlides: boolean = false) => {
    const wasAutoplay = isAutoplay;
    setIsAutoplay(false); // Pause autoplay during capture

    if (allSlides) {
      toast.info('🖼️ Generating images for all slides...', {
        description: 'Please wait while we capture each slide'
      });

      try {
        const originalSlide = currentSlide;

        for (let i = 0; i < documentProcessingSlides.length; i++) {
          setCurrentSlide(i);
          // Wait longer for animation to complete
          await new Promise(resolve => setTimeout(resolve, 800));

          const slideElement = document.querySelector('[data-slide-inner]') as HTMLElement;
          if (!slideElement) {
            console.warn(`Could not find slide content for slide ${i + 1}`);
            continue;
          }

          const canvas = await html2canvas(slideElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0f172a',
            logging: false,
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector('[data-slide-inner]') as HTMLElement;
              if (clonedElement) {
                clonedElement.style.transform = 'none';
                clonedElement.style.opacity = '1';
              }
            }
          });

          const link = document.createElement('a');
          link.download = `slide-${String(i + 1).padStart(2, '0')}-${documentProcessingSlides[i].title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();

          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setCurrentSlide(originalSlide);
        if (wasAutoplay) setIsAutoplay(true);
        
        toast.success('✅ All slides downloaded as PNG!', {
          description: `${documentProcessingSlides.length} images saved`
        });
      } catch (error) {
        console.error('Image generation error:', error);
        toast.error('Failed to generate images');
      }
    } else {
      // Download current slide only
      toast.info('🖼️ Capturing current slide...');

      try {
        // Wait for any ongoing animations
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const slideElement = document.querySelector('[data-slide-inner]') as HTMLElement;
        if (!slideElement) {
          toast.error('Could not find slide content');
          if (wasAutoplay) setIsAutoplay(true);
          return;
        }

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f172a',
          logging: false,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-slide-inner]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.transform = 'none';
              clonedElement.style.opacity = '1';
            }
          }
        });

        const link = document.createElement('a');
        link.download = `slide-${String(currentSlide + 1).padStart(2, '0')}-${documentProcessingSlides[currentSlide].title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (wasAutoplay) setIsAutoplay(true);
        toast.success('✅ Slide saved as PNG!', {
          description: documentProcessingSlides[currentSlide].title
        });
      } catch (error) {
        console.error('Image generation error:', error);
        toast.error('Failed to capture slide');
      }
    }
  };

  // Use standardized presentation share hook
  const { 
    shareToLinkedIn, 
    copyLink: copyShareableLink, 
    openPresentation: openPublicPresentation,
    getShareUrls 
  } = usePresentationShare({ presentationId: 'document-processing' });

  const startVideoRecording = async () => {
    try {
      if (!containerRef.current) return;
      
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document-processing-presentation.webm';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Video downloaded! Convert to MP4 for LinkedIn upload.');
        setIsRecording(false);
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started! Navigate through slides, then click Stop to save.');
      
      // Auto-start autoplay for recording
      setIsAutoplay(true);
    } catch (err) {
      console.error('Recording error:', err);
      toast.error('Failed to start recording. Please allow screen sharing.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsAutoplay(false);
    }
  };


  const currentSlideData = documentProcessingSlides[currentSlide];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-gradient-to-br from-background via-background to-muted/30",
        isFullscreen ? "fixed inset-0 z-50" : "w-full rounded-xl shadow-2xl border"
      )}
    >
      {/* Header Controls */}
      <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Document Processing Platform
            </h1>
            <p className="text-xs text-muted-foreground">Interactive Presentation</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {currentSlide + 1} / {documentProcessingSlides.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={isAutoplay ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="gap-1"
          >
            {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoplay ? 'Pause' : 'Auto'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setCurrentSlide(0)} className="gap-1">
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1">
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          {/* Download Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Download
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Best for visual fidelity
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={downloadPDF} className="gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <div className="flex flex-col">
                  <span>Download as PDF</span>
                  <span className="text-xs text-muted-foreground">All slides, exact formatting</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsImages(false)} className="gap-2">
                <Image className="w-4 h-4 text-green-500" />
                <div className="flex flex-col">
                  <span>Current Slide as PNG</span>
                  <span className="text-xs text-muted-foreground">Exact visual capture</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsImages(true)} className="gap-2">
                <FileImage className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col">
                  <span>All Slides as PNG</span>
                  <span className="text-xs text-muted-foreground">{documentProcessingSlides.length} images</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Editable format
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={downloadPPT} className="gap-2">
                <Presentation className="w-4 h-4 text-orange-500" />
                <div className="flex flex-col">
                  <span>Download as PPT</span>
                  <span className="text-xs text-muted-foreground">Editable PowerPoint</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Video Recording */}
          {!isRecording ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startVideoRecording} 
              className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
              title="Record presentation as video"
            >
              <MonitorPlay className="w-4 h-4" />
              Record
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={stopVideoRecording} 
              className="gap-1 bg-red-600 hover:bg-red-700 animate-pulse"
            >
              <Pause className="w-4 h-4" />
              Stop Recording
            </Button>
          )}
          
          {/* Copy Link */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyShareableLink} 
            className="gap-1"
            title="Copy public shareable link"
          >
            <Link2 className="w-4 h-4" />
            Copy Link
          </Button>
          
          {/* Open Public View */}
          {!isPublicView && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openPublicPresentation} 
              className="gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
              title="Open public presentation in new tab"
            >
              <Globe className="w-4 h-4" />
              Public
            </Button>
          )}
          
          {/* LinkedIn Share */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={shareToLinkedIn} 
            className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          
          {onExit && !isPublicView && (
            <Button variant="destructive" size="sm" onClick={onExit}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Slide Area */}
      <div 
        data-slide-content
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          isFullscreen ? "h-[calc(100vh-120px)]" : "h-[620px]"
        )}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 p-5 overflow-y-auto"
          >
            {/* Inner content wrapper for screen capture - this stays static */}
            <div 
              data-slide-inner 
              className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 rounded-lg"
            >
              <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-white mb-1">
                  {currentSlideData.title}
                </h2>
                {currentSlideData.subtitle && (
                  <p className="text-sm text-slate-400">
                    {currentSlideData.subtitle}
                  </p>
                )}
              </div>
              
              <div className="max-w-6xl mx-auto">
                {currentSlideData.content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-3 border-t bg-gradient-to-r from-muted/20 via-background to-muted/20">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex gap-1.5 overflow-x-auto max-w-md px-4">
          {documentProcessingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0",
                index === currentSlide
                  ? "bg-primary scale-125"
                  : "bg-muted hover:bg-muted-foreground/50"
              )}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === documentProcessingSlides.length - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentProcessingPresentation;
