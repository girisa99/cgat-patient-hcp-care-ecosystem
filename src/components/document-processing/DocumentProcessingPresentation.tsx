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
  ChevronDown, Check, Star, Crown, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import pptxgen from 'pptxgenjs';

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
// SLIDE 1: PROBLEM STATEMENT - Enhanced with visual storytelling
// =============================================================================
const ProblemStatementSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    {/* Hero Banner */}
    <motion.div 
      {...fadeInUp}
      className="relative bg-gradient-to-r from-red-900 via-red-800 to-orange-900 rounded-2xl p-8 text-white overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.958 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-3.486 3.485-1.414-1.414L30.172 0H32z%22 fill=%22%23ffffff%22 fill-opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AlertCircle className="w-12 h-12 text-red-300 mb-2" />
            <h3 className="text-3xl font-bold">The Healthcare Document Crisis</h3>
            <p className="text-lg text-red-200">Manual processing is killing productivity</p>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 gap-3"
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
              className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-red-200">{stat.label}</div>
              <div className="text-xs text-red-300/70">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>

    {/* Pain Points Flow */}
    <div className="grid grid-cols-4 gap-4">
      {[
        { icon: Clock, title: "Time Drain", desc: "Staff spend hours on repetitive data entry", impact: "Lost productivity", color: "red" },
        { icon: DollarSign, title: "High Costs", desc: "$15-50 per document for manual processing", impact: "$500K+ annually", color: "orange" },
        { icon: AlertCircle, title: "Error Prone", desc: "15-30% error rates in manual extraction", impact: "Compliance risk", color: "yellow" },
        { icon: Users, title: "Staff Burnout", desc: "Repetitive tasks lead to high turnover", impact: "60% more turnover", color: "purple" },
      ].map((pain, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className="relative"
        >
          <div className={`bg-gradient-to-br from-${pain.color}-50 to-${pain.color}-100/50 rounded-xl p-5 border border-${pain.color}-200 h-full`}>
            <div className={`w-10 h-10 bg-${pain.color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <pain.icon className={`w-5 h-5 text-${pain.color}-600`} />
            </div>
            <h4 className="font-bold text-foreground mb-1">{pain.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{pain.desc}</p>
            <Badge variant="destructive" className="text-xs">{pain.impact}</Badge>
          </div>
          {i < 3 && (
            <motion.div
              className="absolute top-1/2 -right-2 z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
      className="bg-gradient-to-r from-red-100 via-orange-50 to-yellow-100 rounded-xl p-4 border border-red-200 text-center"
    >
      <p className="text-lg font-medium text-red-900">
        <strong>The Reality:</strong> Healthcare organizations lose millions annually while struggling with accuracy and compliance.
        <span className="text-red-600 font-bold"> There has to be a better way.</span>
      </p>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 2: CURRENT TOOLS - Enhanced with comparison
// =============================================================================
const CurrentToolsSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <Badge variant="outline" className="text-lg px-4 py-1 border-gray-400 text-gray-700">
        <Settings className="w-4 h-4 mr-2 inline" />
        Why Traditional Tools Fail
      </Badge>
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
          color: "gray"
        },
        {
          title: "Rule-Based Systems",
          icon: Settings,
          status: "Rigid",
          problems: ["Hard-coded rules", "Breaks with format changes", "Extensive maintenance", "No adaptability", "High implementation cost"],
          accuracy: "70-80%",
          effort: "100+ hrs/month",
          color: "gray"
        },
        {
          title: "Single AI Model",
          icon: Bot,
          status: "Limited",
          problems: ["One-size-fits-all", "Poor on specialized docs", "No model optimization", "High token costs", "Inconsistent results"],
          accuracy: "75-85%",
          effort: "3-5x cost",
          color: "gray"
        }
      ].map((tool, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, rotateY: -20 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ delay: i * 0.2, type: "spring" }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
              <tool.icon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{tool.title}</h4>
              <Badge variant="outline" className="text-gray-500 text-xs">{tool.status}</Badge>
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
                <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-muted-foreground">{problem}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-red-50 rounded-lg text-center">
              <div className="text-xs text-red-600 font-medium">Accuracy</div>
              <div className="text-sm font-bold text-red-700">{tool.accuracy}</div>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-center">
              <div className="text-xs text-orange-600 font-medium">Effort</div>
              <div className="text-sm font-bold text-orange-700">{tool.effort}</div>
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
      className="flex items-center justify-center gap-4 py-4"
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-primary" />
        </motion.div>
        <span className="text-lg font-bold text-primary">Time for a Revolution</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 via-gray-300 to-transparent" />
    </motion.div>

    {/* Solution Preview */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 text-center"
    >
      <h4 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        What if AI could intelligently route documents to the best model?
      </h4>
      <p className="text-muted-foreground">
        Introducing <strong className="text-primary">Multi-Model Intelligent Routing</strong> - where AI decides which AI to use
      </p>
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 3: AI TRANSFORMATION - How AI Benefits the Process
// =============================================================================
const AITransformationSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <Sparkles className="w-4 h-4 mr-2 inline" />
        The AI-Powered Transformation
      </Badge>
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
// SLIDE 4: MULTI-MODEL ROUTING - Fully Animated with Details
// =============================================================================
const WhyMultiModelSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <BrainCircuit className="w-4 h-4 mr-2 inline" />
        Intelligent Multi-Model Routing
      </Badge>
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
          <motion.path d="M 475 75 Q 520 50 580 35" fill="none" stroke="#f97316" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }}/>
          <motion.path d="M 475 90 L 580 90" fill="none" stroke="#22c55e" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.5 }}/>
          <motion.path d="M 475 105 Q 520 130 580 145" fill="none" stroke="#3b82f6" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.0, duration: 0.5 }}/>
          <motion.path d="M 475 115 Q 520 155 580 170" fill="none" stroke="#8b5cf6" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.5 }}/>

          {/* Model Nodes */}
          {[
            { y: 25, name: "Claude", task: "Medical", color: "#f97316", acc: "98%" },
            { y: 80, name: "GPT-4o", task: "Handwriting", color: "#22c55e", acc: "96%" },
            { y: 135, name: "Gemini Flash", task: "Tables", color: "#3b82f6", acc: "97%" },
            { y: 165, name: "Gemini Pro", task: "Images", color: "#8b5cf6", acc: "95%" },
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
            <rect x="720" y="70" width="70" height="40" rx="8" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2"/>
            <text x="755" y="88" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">Extracted</text>
            <text x="755" y="102" fill="#86efac" fontSize="9" textAnchor="middle">Data</text>
          </motion.g>
        </svg>
      </div>
    </motion.div>

    {/* Model Details Cards */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { 
          model: "Claude 3.5 Sonnet", 
          icon: "🟠", 
          color: "orange",
          tasks: ["Medical Records", "Complex Forms", "Prior Auth"],
          strength: "Superior reasoning & context",
          example: "Patient history with multiple conditions"
        },
        { 
          model: "GPT-4o Vision", 
          icon: "🟢", 
          color: "green",
          tasks: ["Handwritten Rx", "Signatures", "Annotations"],
          strength: "Best-in-class handwriting OCR",
          example: "Doctor's handwritten prescription"
        },
        { 
          model: "Gemini 1.5 Flash", 
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
// SLIDE 5: DOCUMENT CONFIGURATION - Animated Auto-Detection Flow
// =============================================================================
const DocumentConfigSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <Settings className="w-4 h-4 mr-2 inline" />
        Zero Configuration Auto-Detection
      </Badge>
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
    "stage1": "gpt-4o-vision",
    "stage2": "claude-sonnet"
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
// SLIDE 6: TWO-STAGE PIPELINE - Enhanced Animation
// =============================================================================
const TwoStagePipelineSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <GitBranch className="w-4 h-4 mr-2 inline" />
        Two-Stage Pipeline Architecture
      </Badge>
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
          { type: "📊 Tables", stage1: "Gemini Flash", stage2: "Gemini Pro", color: "blue" },
          { type: "✍️ Handwriting", stage1: "GPT-4o Vision", stage2: "GPT-4o", color: "green" },
          { type: "🏥 Medical", stage1: "Claude Vision", stage2: "Claude Sonnet", color: "purple" },
          { type: "📋 Forms", stage1: "Gemini Pro", stage2: "Gemini Flash", color: "orange" },
          { type: "🖼️ Images", stage1: "GPT-4o Vision", stage2: "Gemini Pro", color: "cyan" },
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
// SLIDE 7: SOLUTION ARCHITECTURE - Complete Visual Overview
// =============================================================================
const SolutionArchitectureSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <Layers className="w-4 h-4 mr-2 inline" />
        Complete Solution Architecture
      </Badge>
    </motion.div>

    {/* Full Architecture Diagram */}
    <motion.div
      {...fadeInUp}
      className="bg-gradient-to-br from-slate-900 via-indigo-900/80 to-slate-900 rounded-2xl p-6 relative overflow-hidden"
    >
      <svg className="w-full h-80" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="layerGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
          <linearGradient id="layerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
          <linearGradient id="layerGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
          <linearGradient id="layerGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
        </defs>

        {/* Layer 1: Input */}
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <rect x="50" y="20" width="800" height="50" rx="10" fill="url(#layerGrad1)" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2"/>
          <text x="90" y="50" fill="white" fontSize="12" fontWeight="bold">INPUT LAYER</text>
          {["PDF", "Images", "Scans", "Photos", "Fax"].map((item, i) => (
            <g key={i}>
              <rect x={220 + i * 120} y="30" width="80" height="30" rx="6" fill="white" fillOpacity="0.1"/>
              <text x={260 + i * 120} y="50" fill="white" fontSize="10" textAnchor="middle">{item}</text>
            </g>
          ))}
        </motion.g>

        {/* Connecting Lines */}
        <motion.path d="M 450 70 L 450 90" stroke="white" strokeWidth="2" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }}/>

        {/* Layer 2: Intelligence */}
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <rect x="50" y="90" width="800" height="50" rx="10" fill="url(#layerGrad2)" fillOpacity="0.3" stroke="#8b5cf6" strokeWidth="2"/>
          <text x="90" y="120" fill="white" fontSize="12" fontWeight="bold">INTELLIGENCE</text>
          {["Auto-Config", "Classification", "Routing", "Optimization"].map((item, i) => (
            <g key={i}>
              <rect x={220 + i * 150} y="100" width="120" height="30" rx="6" fill="white" fillOpacity="0.1"/>
              <text x={280 + i * 150} y="120" fill="white" fontSize="10" textAnchor="middle">{item}</text>
            </g>
          ))}
        </motion.g>

        <motion.path d="M 450 140 L 450 160" stroke="white" strokeWidth="2" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }}/>

        {/* Layer 3: Processing */}
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <rect x="50" y="160" width="800" height="50" rx="10" fill="url(#layerGrad3)" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2"/>
          <text x="90" y="190" fill="white" fontSize="12" fontWeight="bold">PROCESSING</text>
          {["Vision AI", "NLP Extraction", "Validation", "Confidence"].map((item, i) => (
            <g key={i}>
              <rect x={220 + i * 150} y="170" width="120" height="30" rx="6" fill="white" fillOpacity="0.1"/>
              <text x={280 + i * 150} y="190" fill="white" fontSize="10" textAnchor="middle">{item}</text>
            </g>
          ))}
        </motion.g>

        <motion.path d="M 450 210 L 450 230" stroke="white" strokeWidth="2" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }}/>

        {/* Layer 4: Output */}
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <rect x="50" y="230" width="800" height="50" rx="10" fill="url(#layerGrad4)" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2"/>
          <text x="90" y="260" fill="white" fontSize="12" fontWeight="bold">OUTPUT</text>
          {["JSON/FHIR", "EHR Systems", "Webhooks", "MCP SDK", "Supabase"].map((item, i) => (
            <g key={i}>
              <rect x={220 + i * 110} y="240" width="90" height="30" rx="6" fill="white" fillOpacity="0.1"/>
              <text x={265 + i * 110} y="260" fill="white" fontSize="10" textAnchor="middle">{item}</text>
            </g>
          ))}
        </motion.g>
      </svg>
    </motion.div>

    {/* Key Metrics */}
    <motion.div {...fadeInUp} className="grid grid-cols-4 gap-4">
      {[
        { icon: Zap, label: "Processing Time", value: "<3 sec", color: "blue" },
        { icon: Shield, label: "HIPAA Compliant", value: "100%", color: "green" },
        { icon: Target, label: "Accuracy Rate", value: "95%+", color: "purple" },
        { icon: DollarSign, label: "Cost per Doc", value: "$0.05", color: "orange" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + i * 0.1 }}
          className={`text-center p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}
        >
          <item.icon className={`w-8 h-8 text-${item.color}-500 mx-auto mb-2`} />
          <div className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// =============================================================================
// SLIDE 8: LIVE DEMO - Animated Document Processing Flow
// =============================================================================
const LiveDemoSlide = () => {
  const [demoStep, setDemoStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div {...fadeInUp} className="text-center mb-2">
        <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <MonitorPlay className="w-4 h-4 mr-2 inline" />
          Live Processing Demo
        </Badge>
      </motion.div>

      {/* Demo Flow */}
      <motion.div
        {...fadeInUp}
        className="bg-gradient-to-br from-slate-900 via-cyan-900/50 to-slate-900 rounded-2xl p-6"
      >
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { icon: Upload, label: "Upload" },
            { icon: Eye, label: "Detect" },
            { icon: Cpu, label: "Extract" },
            { icon: PenTool, label: "Edit" },
            { icon: Link2, label: "Integrate" },
            { icon: Send, label: "Push" },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                className={cn("flex flex-col items-center transition-all", i <= demoStep ? "opacity-100" : "opacity-40")}
                animate={i === demoStep ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors",
                  i < demoStep ? "bg-green-500" : i === demoStep ? "bg-cyan-500" : "bg-gray-600"
                )}>
                  {i < demoStep ? <Check className="w-6 h-6 text-white" /> : <step.icon className="w-6 h-6 text-white" />}
                </div>
                <span className="text-xs text-white font-medium">{step.label}</span>
              </motion.div>
              {i < 5 && <div className={cn("flex-1 h-1 mx-2 rounded", i < demoStep ? "bg-green-500" : "bg-gray-700")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Demo Content Area */}
        <div className="grid grid-cols-3 gap-4">
          {/* Document Preview */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Prescription Document
            </h5>
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="h-3 bg-gray-400/30 rounded w-3/4" />
              <div className="h-3 bg-gray-400/30 rounded w-1/2" />
              <div className="h-3 bg-gray-400/30 rounded w-5/6" />
              <div className="h-3 bg-blue-400/50 rounded w-2/3" />
              <div className="h-3 bg-green-400/50 rounded w-4/5" />
            </div>
            <Badge className="mt-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Type: Prescription</Badge>
          </div>

          {/* Extracted Fields */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
              <Database className="w-4 h-4" /> Extracted Fields
            </h5>
            <div className="space-y-2">
              {[
                { field: "Patient", value: "John Smith", conf: 98 },
                { field: "Medication", value: "Metformin", conf: 96, editable: true },
                { field: "Dosage", value: "500mg", conf: 94 },
                { field: "Frequency", value: "BID", conf: 92 },
                { field: "Provider NPI", value: "1234567890", conf: 99 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded"
                >
                  <div className="flex-1">
                    <span className="text-xs text-gray-400">{item.field}</span>
                    <div className="text-sm text-white font-medium flex items-center gap-1">
                      {item.value}
                      {item.editable && <PenTool className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 text-xs">{item.conf}%</Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Drug Integrations
            </h5>
            <div className="space-y-2">
              {[
                { name: "RxNorm", status: "Connected", icon: Pill },
                { name: "DrugBank", status: "Active", icon: Database },
                { name: "NDC Lookup", status: "Verified", icon: CheckCircle },
                { name: "FDA Database", status: "Live", icon: Shield },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20"
                >
                  <item.icon className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white flex-1">{item.name}</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">{item.status}</Badge>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <div className="text-xs text-cyan-300 mb-2">Push to:</div>
              <div className="flex flex-wrap gap-2">
                {["Epic EHR", "Supabase", "Salesforce", "HubSpot"].map((target, i) => (
                  <Badge key={i} variant="outline" className="text-cyan-400 border-cyan-400/30 text-xs">{target}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =============================================================================
// SLIDE 9: SUB-AGENTS - Ready Agents and Canvas
// =============================================================================
const SubAgentSlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
        <Bot className="w-4 h-4 mr-2 inline" />
        Sub-Agent Intelligence & Ready Agents
      </Badge>
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
// SLIDE 11: ROI - Lovable vs Traditional (Team Comparison)
// =============================================================================
const ROISlide = () => (
  <motion.div className="space-y-5" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-2">
      <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <BarChart3 className="w-4 h-4 mr-2 inline" />
        Lovable vs Traditional Development
      </Badge>
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
            Lovable AI Development
          </h4>
          <Badge className="bg-green-500 text-white">99% Savings</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <h5 className="font-semibold text-foreground text-sm">Resources Used:</h5>
          {[
            { item: "Lovable AI Platform", detail: "Full-stack development", cost: "$200/mo" },
            { item: "AI Processing Credits", detail: "Document processing", cost: "$500" },
            { item: "Supabase Backend", detail: "Database & auth", cost: "$25/mo" },
            { item: "Domain Expert", detail: "Part-time guidance", cost: "10 hrs" },
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
            <div className="text-2xl font-bold text-green-700">1 Person</div>
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
// SLIDES ARRAY
// =============================================================================
const documentProcessingSlides: Slide[] = [
  { 
    id: 1, 
    title: "The Healthcare Document Crisis", 
    subtitle: "Why manual processing is killing productivity",
    animation: 'fade', 
    content: <ProblemStatementSlide />,
    pptContent: {
      bullets: [
        "4+ hours per day spent on manual data entry",
        "$15-50 cost per document processed manually",
        "15-30% error rates in manual extraction",
        "High staff turnover due to repetitive tasks",
        "48-hour average turnaround time",
        "Annual costs exceeding $500K for mid-size organizations"
      ],
      notes: "Healthcare organizations waste millions annually on manual document processing while struggling with accuracy and compliance requirements."
    }
  },
  { 
    id: 2, 
    title: "Why Traditional Tools Fail", 
    subtitle: "The limitations of current approaches",
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
        "Claude 3.5 Sonnet: Medical records, complex forms (98% accuracy)",
        "GPT-4o Vision: Handwritten prescriptions, signatures (96% accuracy)",
        "Gemini 1.5 Flash: Lab results, tables, structured data (97% accuracy)",
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
    title: "Live Processing Demo", 
    subtitle: "Document upload to data extraction in action",
    animation: 'fade', 
    content: <LiveDemoSlide />,
    pptContent: {
      bullets: [
        "Step 1: Upload prescription document",
        "Step 2: AI auto-detects document type",
        "Step 3: Multi-model extraction with 96%+ confidence",
        "Step 4: Edit fields with drug database integration",
        "Step 5: Integration with RxNorm, DrugBank, NDC, FDA",
        "Step 6: Push to EHR, Supabase, Salesforce, HubSpot"
      ],
      notes: "Live demonstration of the complete document processing workflow from upload to external system integration."
    }
  },
  { 
    id: 9, 
    title: "Sub-Agent Intelligence", 
    subtitle: "Ready agents and canvas orchestration",
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
      notes: "Pre-built agents can be deployed immediately or configured for specific workflows, with support for various agent architectures."
    }
  },
  { 
    id: 10, 
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
    id: 11, 
    title: "Lovable vs Traditional Development", 
    subtitle: "Cost, time, and resource comparison",
    animation: 'fade', 
    content: <ROISlide />,
    pptContent: {
      bullets: [
        "Traditional: 10-person team (BA, Architect, 4 Devs, 2 Server, 2 QA)",
        "Traditional: 6-9 months timeline, $350K+ cost, high risk",
        "Lovable: 1 person + AI platform",
        "Lovable: 2-4 weeks timeline, $2,500 total cost, low risk",
        "ROI: 99% cost savings, 95% time savings, 90% team reduction",
        "50x faster time to value"
      ],
      notes: "Lovable AI dramatically reduces development costs and timeline while maintaining high quality and reducing project risk."
    }
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
interface DocumentProcessingPresentationProps {
  onExit?: () => void;
}

export const DocumentProcessingPresentation: React.FC<DocumentProcessingPresentationProps> = ({ onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      toast.info('Generating PowerPoint with full content...');
      
      const pptx = new pptxgen();
      pptx.title = 'Document Processing Platform - Multi-Model AI';
      pptx.author = 'Lovable AI';
      pptx.subject = 'Intelligent Document Processing with Multi-Model Routing';
      pptx.company = 'Lovable';
      
      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.addText('Document Processing Platform', { 
        x: 0.5, y: 2, w: '90%', h: 1,
        fontSize: 44, bold: true, color: '1e293b',
        align: 'center', fontFace: 'Arial'
      });
      titleSlide.addText('Multi-Model AI for Intelligent Document Extraction', {
        x: 0.5, y: 3.2, w: '90%', h: 0.5,
        fontSize: 22, color: '64748b',
        align: 'center', fontFace: 'Arial'
      });
      titleSlide.addText('Powered by Lovable AI', {
        x: 0.5, y: 4.5, w: '90%', h: 0.3,
        fontSize: 14, color: '8b5cf6',
        align: 'center', fontFace: 'Arial', italic: true
      });
      
      // Content slides with full bullet points
      documentProcessingSlides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // Slide number
        pptSlide.addText(`${index + 1} / ${documentProcessingSlides.length}`, {
          x: 8.5, y: 0.2, w: 1.5, h: 0.3,
          fontSize: 10, color: '94a3b8', align: 'right'
        });
        
        // Title
        pptSlide.addText(slide.title, {
          x: 0.5, y: 0.4, w: '90%', h: 0.8,
          fontSize: 32, bold: true, color: '1e293b',
          fontFace: 'Arial'
        });
        
        // Subtitle
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, {
            x: 0.5, y: 1.2, w: '90%', h: 0.4,
            fontSize: 18, color: '64748b',
            fontFace: 'Arial'
          });
        }
        
        // Content bullets
        if (slide.pptContent?.bullets) {
          const bulletText = slide.pptContent.bullets.map(bullet => ({
            text: `• ${bullet}\n`,
            options: { fontSize: 16, color: '334155' }
          }));
          
          pptSlide.addText(bulletText, {
            x: 0.5, y: 1.8, w: '90%', h: 4,
            fontFace: 'Arial', valign: 'top'
          });
        }
        
        // Speaker notes
        if (slide.pptContent?.notes) {
          pptSlide.addNotes(slide.pptContent.notes);
        }
      });
      
      // Summary slide
      const summarySlide = pptx.addSlide();
      summarySlide.addText('Key Takeaways', {
        x: 0.5, y: 0.4, w: '90%', h: 0.8,
        fontSize: 36, bold: true, color: '1e293b',
        fontFace: 'Arial'
      });
      
      const summaryBullets = [
        { text: '• Multi-model routing achieves 95%+ accuracy', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• Zero-configuration auto-detection for any document', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• Two-stage pipeline: Vision AI + NLP processing', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• Drug integrations: DrugBank, RxNorm, NDC, FDA', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• Ready agents for Prior Auth, EHR, Drug Checks', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• MCP SDK for Salesforce, HubSpot integration', options: { bullet: false, fontSize: 18, color: '334155' } },
        { text: '• 99% cost reduction: $350K → $2,500', options: { bullet: false, fontSize: 18, color: '22c55e', bold: true } },
        { text: '• 95% time reduction: 9 months → 3 weeks', options: { bullet: false, fontSize: 18, color: '22c55e', bold: true } },
      ];
      
      summarySlide.addText(summaryBullets, {
        x: 0.5, y: 1.5, w: '90%', h: 4,
        fontFace: 'Arial', valign: 'top'
      });
      
      // Contact/CTA slide
      const ctaSlide = pptx.addSlide();
      ctaSlide.addText('Ready to Transform Your Document Processing?', {
        x: 0.5, y: 2, w: '90%', h: 1,
        fontSize: 36, bold: true, color: '1e293b',
        align: 'center', fontFace: 'Arial'
      });
      ctaSlide.addText('Get started with Lovable AI today', {
        x: 0.5, y: 3.2, w: '90%', h: 0.5,
        fontSize: 24, color: '8b5cf6',
        align: 'center', fontFace: 'Arial'
      });
      ctaSlide.addText('lovable.dev', {
        x: 0.5, y: 4, w: '90%', h: 0.4,
        fontSize: 20, color: '3b82f6',
        align: 'center', fontFace: 'Arial', hyperlink: { url: 'https://lovable.dev' }
      });
      
      await pptx.writeFile({ fileName: 'document-processing-platform.pptx' });
      toast.success('PowerPoint downloaded with full content!');
    } catch (error) {
      console.error('PPT generation error:', error);
      toast.error('Failed to generate PowerPoint');
    }
  };

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(
      "🚀 Revolutionizing Document Processing with Multi-Model AI!\n\n" +
      "✅ 95%+ accuracy with intelligent model routing\n" +
      "✅ 75x faster than manual processing\n" +
      "✅ 99% cost reduction ($350K → $2,500)\n" +
      "✅ Zero configuration auto-detection\n\n" +
      "Built with @Lovable AI in just 3 weeks!\n\n" +
      "#AI #DocumentProcessing #Healthcare #Automation #Lovable"
    );
    const url = encodeURIComponent("https://lovable.dev");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
    toast.success('Opening LinkedIn share dialog...');
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
        
        <div className="flex items-center gap-2">
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
          
          <Button variant="outline" size="sm" onClick={downloadPPT} className="gap-1">
            <Download className="w-4 h-4" />
            PPT
          </Button>
          
          <Button variant="outline" size="sm" onClick={shareToLinkedIn} className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50">
            <Linkedin className="w-4 h-4" />
            Share
          </Button>
          
          {onExit && (
            <Button variant="destructive" size="sm" onClick={onExit}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className={cn(
        "relative overflow-hidden",
        isFullscreen ? "h-[calc(100vh-120px)]" : "h-[620px]"
      )}>
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
            <div className="text-center mb-3">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {currentSlideData.title}
              </h2>
              {currentSlideData.subtitle && (
                <p className="text-sm text-muted-foreground">
                  {currentSlideData.subtitle}
                </p>
              )}
            </div>
            
            <div className="max-w-6xl mx-auto">
              {currentSlideData.content}
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
