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
  Stethoscope, ClipboardList, HeartPulse, RefreshCw
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
}

// Animation variants for slides
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
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

// Animated Data Flow Dot Component
const AnimatedDataDot = ({ delay = 0, color = "primary" }: { delay?: number; color?: string }) => (
  <motion.div
    className={`w-2 h-2 rounded-full bg-${color}`}
    animate={{
      x: [0, 80, 160],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

// Pulsing Connection Line
const PulsingLine = ({ horizontal = true }: { horizontal?: boolean }) => (
  <div className={cn("relative", horizontal ? "h-1 w-16" : "w-1 h-16")}>
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
      animate={{ x: horizontal ? [-20, 40] : undefined, y: horizontal ? undefined : [-20, 40] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      style={{ opacity: 0.6 }}
    />
  </div>
);

// Slide 1: Problem Statement
const ProblemStatementSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-8">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-100 rounded-full border border-red-200">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-red-700">The Challenge</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pain Points */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Industry Pain Points
        </h3>
        
        <div className="space-y-3">
          {[
            { icon: Clock, text: "Hours spent on manual data entry", stat: "4+ hours/day" },
            { icon: DollarSign, text: "High processing costs per document", stat: "$15-50/doc" },
            { icon: AlertCircle, text: "Error rates in manual extraction", stat: "15-30%" },
            { icon: Users, text: "Staff burnout from repetitive tasks", stat: "High turnover" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <span className="text-foreground">{item.text}</span>
              </div>
              <Badge variant="destructive">{item.stat}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Impact */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Business Impact
        </h3>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Documents/Day", value: "500+", desc: "Manual processing" },
              { label: "Staff Required", value: "8-12", desc: "Full-time data entry" },
              { label: "Processing Time", value: "48hrs", desc: "Average turnaround" },
              { label: "Annual Cost", value: "$500K+", desc: "Labor + errors" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="text-2xl font-bold text-red-600">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-amber-800 text-sm">
            <strong>The Reality:</strong> Healthcare organizations spend millions annually on 
            manual document processing while struggling with accuracy and compliance.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);

// Slide 2: Current Tools (1:1 and less intelligent)
const CurrentToolsSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
        <Settings className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Traditional Approach</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Traditional OCR */}
      <motion.div {...fadeInUp} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Traditional OCR</h4>
            <Badge variant="outline" className="text-gray-500">Legacy</Badge>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>❌ Template-based extraction</li>
          <li>❌ Single model approach</li>
          <li>❌ High error rates (20%+)</li>
          <li>❌ No context understanding</li>
          <li>❌ Manual configuration needed</li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <span className="text-xs text-red-600">Accuracy: 60-70%</span>
        </div>
      </motion.div>

      {/* Rule-Based Systems */}
      <motion.div {...fadeInUp} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Rule-Based</h4>
            <Badge variant="outline" className="text-gray-500">Rigid</Badge>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>❌ Hard-coded rules</li>
          <li>❌ Breaks with format changes</li>
          <li>❌ Extensive maintenance</li>
          <li>❌ No adaptability</li>
          <li>❌ High implementation cost</li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <span className="text-xs text-red-600">Maintenance: 100+ hrs/month</span>
        </div>
      </motion.div>

      {/* Single AI Model */}
      <motion.div {...fadeInUp} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Single AI Model</h4>
            <Badge variant="outline" className="text-gray-500">Limited</Badge>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>❌ One-size-fits-all</li>
          <li>❌ Poor on specialized docs</li>
          <li>❌ No model optimization</li>
          <li>❌ High token costs</li>
          <li>❌ Inconsistent results</li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <span className="text-xs text-red-600">Cost: 3-5x higher</span>
        </div>
      </motion.div>
    </div>

    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 text-center"
    >
      <h4 className="text-lg font-semibold text-foreground mb-2">The 1:1 Mapping Problem</h4>
      <p className="text-muted-foreground">
        Traditional tools require manual configuration for each document type, creating maintenance nightmares 
        and failing when documents don't match expected formats exactly.
      </p>
    </motion.div>
  </motion.div>
);

// Slide 3: Why Multi-Model Routing - ENHANCED with animated flow
const WhyMultiModelSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
        <BrainCircuit className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-700">Intelligent Model Routing</span>
      </div>
    </motion.div>

    {/* Animated Data Flow Diagram */}
    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-xl p-6 border border-purple-500/30 relative overflow-hidden"
    >
      <h4 className="text-white font-semibold mb-6 text-center">Real-Time Model Routing Flow</h4>
      
      <div className="flex items-center justify-between">
        {/* Document Input */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-400 rounded-xl flex items-center justify-center mb-2">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <span className="text-xs text-blue-300 font-medium">Document</span>
          <span className="text-xs text-blue-400/70">Any Format</span>
        </motion.div>

        {/* Animated Connection */}
        <motion.div 
          className="flex-1 mx-4 relative h-8 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500" />
          </div>
          {/* Animated dots */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            animate={{ x: [0, 100, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"
            animate={{ x: [0, 100, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.6 }}
          />
        </motion.div>

        {/* AI Router Brain */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 rounded-full flex items-center justify-center relative z-10">
              <BrainCircuit className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <span className="text-xs text-yellow-300 font-medium mt-2">AI Router</span>
          <span className="text-xs text-yellow-400/70">Content Analysis</span>
        </motion.div>

        {/* Branching Connections */}
        <div className="flex-1 mx-4 relative">
          <svg className="w-full h-24" viewBox="0 0 100 60">
            <motion.path
              d="M 0 30 Q 30 30 50 10"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
            <motion.path
              d="M 0 30 Q 30 30 50 30"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            />
            <motion.path
              d="M 0 30 Q 30 30 50 50"
              stroke="url(#gradient3)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Model Outputs */}
        <div className="flex flex-col gap-2">
          {[
            { name: "Claude", color: "orange", task: "Medical" },
            { name: "GPT-4o", color: "green", task: "Handwriting" },
            { name: "Gemini", color: "blue", task: "Tables" },
          ].map((model, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${model.color}-500/20 border border-${model.color}-400/50`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
            >
              <div className={`w-2 h-2 rounded-full bg-${model.color}-400`} />
              <span className="text-xs text-white font-medium">{model.name}</span>
              <span className="text-xs text-white/60">→ {model.task}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* Detailed Model Examples */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      {[
        { 
          model: "Claude 3.5 Sonnet", 
          icon: "🟠", 
          tasks: ["Medical Records", "Complex Forms", "Legal Documents"],
          strength: "Superior reasoning & context understanding",
          accuracy: "98%",
          example: "Patient history with multiple conditions"
        },
        { 
          model: "GPT-4o Vision", 
          icon: "🟢", 
          tasks: ["Handwritten Rx", "Signatures", "Annotations"],
          strength: "Best-in-class handwriting recognition",
          accuracy: "96%",
          example: "Doctor's handwritten prescription"
        },
        { 
          model: "Gemini 1.5 Flash", 
          icon: "🔵", 
          tasks: ["Lab Results", "Tables", "Structured Data"],
          strength: "Fast processing, excellent for tabular data",
          accuracy: "97%",
          example: "Blood work results with ranges"
        },
        { 
          model: "Gemini 2.5 Pro", 
          icon: "🟣", 
          tasks: ["Medical Images", "X-rays", "Scans"],
          strength: "Multi-modal image analysis",
          accuracy: "95%",
          example: "DICOM imaging with annotations"
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1 }}
          className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{item.model}</h4>
              <Badge variant="secondary" className="text-xs">{item.accuracy} acc</Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            {item.tasks.map((task, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-muted-foreground">{task}</span>
              </div>
            ))}
          </div>
          
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground italic">"{item.example}"</p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Benefits Summary */}
    <motion.div {...fadeInUp} className="grid grid-cols-4 gap-3">
      {[
        { icon: Target, label: "95%+ Accuracy", color: "purple" },
        { icon: DollarSign, label: "60% Cost Savings", color: "green" },
        { icon: Zap, label: "3x Faster", color: "yellow" },
        { icon: Shield, label: "Zero Config", color: "blue" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + i * 0.1 }}
          className={`text-center p-3 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}
        >
          <item.icon className={`w-6 h-6 text-${item.color}-600 mx-auto mb-1`} />
          <div className="text-sm font-bold text-foreground">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// Slide 4: Document Configuration Auto-Detection
const DocumentConfigSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
        <Settings className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Zero Configuration</span>
      </div>
    </motion.div>

    {/* Auto-Detection Flow */}
    <motion.div {...fadeInUp} className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-xl p-6 border border-blue-200">
      <h4 className="text-lg font-semibold text-center text-foreground mb-6">Auto-Detection Pipeline</h4>
      
      <div className="flex items-center justify-between gap-4">
        {[
          { icon: Upload, label: "Upload", desc: "Any document format" },
          { icon: Eye, label: "Analyze", desc: "Visual inspection" },
          { icon: BrainCircuit, label: "Classify", desc: "AI classification" },
          { icon: Settings, label: "Configure", desc: "Auto field mapping" },
          { icon: FileCheck, label: "Extract", desc: "Optimized extraction" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2
                ${i === 0 ? 'bg-blue-100' : i === 1 ? 'bg-indigo-100' : i === 2 ? 'bg-purple-100' : i === 3 ? 'bg-violet-100' : 'bg-green-100'}`}>
                <step.icon className={`w-7 h-7 
                  ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-indigo-600' : i === 2 ? 'text-purple-600' : i === 3 ? 'text-violet-600' : 'text-green-600'}`} />
              </div>
              <span className="font-medium text-sm text-foreground">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.desc}</span>
            </motion.div>
            {i < 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* What It Detects */}
      <motion.div {...fadeInUp} className="bg-white rounded-xl p-6 border shadow-sm">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          What It Auto-Detects
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Document Type", "Language", "Orientation", "Quality Level",
            "Handwriting", "Tables", "Signatures", "Stamps/Logos"
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Configuration Output */}
      <motion.div {...fadeInUp} className="bg-white rounded-xl p-6 border shadow-sm">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          Auto-Generated Config
        </h4>
        <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-green-400 overflow-hidden">
          <pre>{`{
  "documentType": "prescription",
  "confidence": 0.94,
  "pipeline": "two-stage",
  "stage1Model": "gpt-4o-vision",
  "stage2Model": "claude-sonnet",
  "fields": ["patient", "provider", 
             "medications", "dosage"]
}`}</pre>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// Slide 5: Two-Stage Pipeline with Multi-Model
const TwoStagePipelineSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 rounded-full border border-green-200">
        <GitBranch className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-700">Two-Stage Pipeline</span>
      </div>
    </motion.div>

    {/* Pipeline Visualization */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stage 1 */}
      <motion.div 
        {...fadeInUp}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div>
            <h4 className="font-bold text-foreground">Stage 1: Classification + OCR</h4>
            <Badge className="bg-blue-100 text-blue-700">Vision AI</Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm text-foreground">Visual Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground">Document type, layout, quality assessment</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-sm text-foreground">Text Extraction</span>
            </div>
            <p className="text-xs text-muted-foreground">OCR with handwriting support</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-sm text-foreground">Model Routing</span>
            </div>
            <p className="text-xs text-muted-foreground">Select optimal Stage 2 model</p>
          </div>
        </div>
      </motion.div>

      {/* Stage 2 */}
      <motion.div 
        {...fadeInUp}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div>
            <h4 className="font-bold text-foreground">Stage 2: Entity Extraction + Validation</h4>
            <Badge className="bg-green-100 text-green-700">NLP AI</Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm text-foreground">Entity Extraction</span>
            </div>
            <p className="text-xs text-muted-foreground">Structured data from raw text</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-sm text-foreground">Validation Rules</span>
            </div>
            <p className="text-xs text-muted-foreground">Healthcare-specific validation</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-teal-500" />
              <span className="font-medium text-sm text-foreground">Confidence Scoring</span>
            </div>
            <p className="text-xs text-muted-foreground">Per-field confidence scores</p>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Model Selection Matrix */}
    <motion.div {...fadeInUp} className="bg-gray-50 rounded-xl p-6 border">
      <h4 className="font-semibold text-foreground mb-4 text-center">Content-Aware Model Selection</h4>
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="p-3 bg-blue-100 rounded-lg text-center">
          <div className="font-medium text-blue-800">Tables</div>
          <div className="text-xs text-blue-600">→ Gemini Flash</div>
        </div>
        <div className="p-3 bg-orange-100 rounded-lg text-center">
          <div className="font-medium text-orange-800">Handwriting</div>
          <div className="text-xs text-orange-600">→ GPT-4o Vision</div>
        </div>
        <div className="p-3 bg-purple-100 rounded-lg text-center">
          <div className="font-medium text-purple-800">Medical</div>
          <div className="text-xs text-purple-600">→ Claude Sonnet</div>
        </div>
        <div className="p-3 bg-green-100 rounded-lg text-center">
          <div className="font-medium text-green-800">Forms</div>
          <div className="text-xs text-green-600">→ Gemini Pro</div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Slide 6: Solution Architecture
const SolutionArchitectureSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-100 rounded-full border border-indigo-200">
        <Layers className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-700">Architecture Overview</span>
      </div>
    </motion.div>

    {/* Architecture Layers */}
    <div className="space-y-4">
      {[
        { layer: "Input Layer", items: ["PDF", "Images", "Scans", "Photos"], color: "blue", desc: "Multi-format document ingestion" },
        { layer: "Intelligence Layer", items: ["Classification", "Routing", "Optimization"], color: "purple", desc: "AI-powered decision making" },
        { layer: "Processing Layer", items: ["Stage 1 (Vision)", "Stage 2 (NLP)", "Validation"], color: "green", desc: "Two-stage extraction pipeline" },
        { layer: "Output Layer", items: ["JSON", "Database", "API", "Webhooks"], color: "orange", desc: "Flexible data delivery" },
      ].map((layer, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className={`bg-${layer.color}-50 rounded-xl p-4 border border-${layer.color}-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 bg-${layer.color}-100 rounded-lg flex items-center justify-center`}>
                <span className={`font-bold text-${layer.color}-600`}>{i + 1}</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{layer.layer}</h4>
                <p className="text-xs text-muted-foreground">{layer.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {layer.items.map((item, j) => (
                <Badge key={j} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Key Features */}
    <motion.div {...fadeInUp} className="grid grid-cols-3 gap-4">
      {[
        { icon: Zap, label: "Real-time Processing", stat: "<3 sec" },
        { icon: Shield, label: "HIPAA Compliant", stat: "100%" },
        { icon: Target, label: "Accuracy Rate", stat: "95%+" },
      ].map((item, i) => (
        <div key={i} className="text-center p-4 bg-white rounded-xl border shadow-sm">
          <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{item.stat}</div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </motion.div>
  </motion.div>
);

// Slide 7: Demo Screenshots - ENHANCED with Prescription Integration
const DemoSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-100 rounded-full border border-cyan-200">
        <Presentation className="w-5 h-5 text-cyan-600" />
        <span className="text-sm font-medium text-cyan-700">Live Demo Showcase</span>
      </div>
    </motion.div>

    {/* Prescription Processing with Integrations */}
    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-xl p-6 border border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white">Prescription Processing Demo</h4>
            <p className="text-xs text-white/60">Real-time medication extraction with drug database integration</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Live</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Extraction Panel */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h5 className="text-white font-medium mb-3 text-sm">Extracted Fields</h5>
          <div className="space-y-2">
            {[
              { field: "Patient Name", value: "John Smith", confidence: 98 },
              { field: "Medication", value: "Metformin", confidence: 96, editable: true },
              { field: "Dosage", value: "500mg", confidence: 94 },
              { field: "Frequency", value: "BID", confidence: 92 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded"
              >
                <div>
                  <span className="text-xs text-white/60">{item.field}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white font-medium">{item.value}</span>
                    {item.editable && (
                      <RefreshCw className="w-3 h-3 text-blue-400 cursor-pointer hover:text-blue-300" />
                    )}
                  </div>
                </div>
                <Badge className={`text-xs ${item.confidence > 95 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {item.confidence}%
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Drug Database Integration */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Drug Database Lookup
          </h5>
          <div className="space-y-2">
            {[
              { db: "DrugBank", icon: "💊", status: "Match Found", color: "green" },
              { db: "RxNorm", icon: "📋", status: "Verified", color: "green" },
              { db: "NDC", icon: "🏷️", status: "Code: 12345-678", color: "blue" },
              { db: "Brand Names", icon: "🔤", status: "Glucophage", color: "purple" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={`flex items-center gap-2 p-2 bg-${item.color}-500/10 rounded border border-${item.color}-500/20`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-xs text-white/60">{item.db}</span>
                  <div className={`text-xs text-${item.color}-300 font-medium`}>{item.status}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-3 p-2 bg-amber-500/10 rounded border border-amber-500/20"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300">Edit medication name to auto-lookup alternatives</span>
            </div>
          </motion.div>
        </div>

        {/* Integration Actions */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h5 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4 text-purple-400" />
            Available Integrations
          </h5>
          <div className="space-y-2">
            {[
              { name: "Update EHR", icon: Stethoscope, color: "blue", action: "Push to Epic/Cerner" },
              { name: "Check Interactions", icon: AlertCircle, color: "orange", action: "Drug-drug check" },
              { name: "Prior Auth", icon: ClipboardList, color: "green", action: "Auto-submit PA" },
              { name: "e-Prescribe", icon: Send, color: "purple", action: "Send to pharmacy" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.1 }}
                className={`flex items-center gap-2 p-2 bg-${item.color}-500/10 rounded border border-${item.color}-500/20 cursor-pointer hover:bg-${item.color}-500/20 transition-colors`}
              >
                <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">{item.name}</span>
                  <div className="text-xs text-white/40">{item.action}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-white/40" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

    {/* Other Demo Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[
        { title: "Patient Onboarding", desc: "Multi-document intake automation", icon: Users, screens: ["ID Scan", "Insurance", "Forms", "Complete"], color: "blue" },
        { title: "Sub-Agent Popups", desc: "AI recommends follow-up actions", icon: Bot, screens: ["Analyze", "Recommend", "Configure", "Deploy"], color: "purple" },
        { title: "External Data Push", desc: "Webhook integration with EHR", icon: Send, screens: ["Extract", "Transform", "Validate", "Push"], color: "teal" },
      ].map((demo, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.15 }}
          className={`bg-gradient-to-br from-${demo.color}-50 to-${demo.color}-100/50 rounded-xl p-4 border border-${demo.color}-200`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 bg-${demo.color}-100 rounded-lg flex items-center justify-center`}>
              <demo.icon className={`w-4 h-4 text-${demo.color}-600`} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{demo.title}</h4>
              <p className="text-xs text-muted-foreground">{demo.desc}</p>
            </div>
          </div>
          
          {/* Mini flow */}
          <div className="flex items-center justify-between bg-white rounded-lg p-2 border">
            {demo.screens.map((screen, j) => (
              <React.Fragment key={j}>
                <div className="text-center">
                  <div className={`w-6 h-6 bg-${demo.color}-100 rounded-full flex items-center justify-center mx-auto mb-1`}>
                    <span className={`text-xs font-bold text-${demo.color}-600`}>{j + 1}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{screen}</span>
                </div>
                {j < demo.screens.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Slide 8: Sub-Agent Follow-up - ENHANCED with animated flow
const SubAgentSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-violet-100 rounded-full border border-violet-200">
        <Bot className="w-5 h-5 text-violet-600" />
        <span className="text-sm font-medium text-violet-700">Sub-Agent Intelligence</span>
      </div>
    </motion.div>

    {/* Animated Sub-Agent Flow */}
    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 rounded-xl p-6 border border-violet-500/30 relative overflow-hidden"
    >
      <h4 className="text-white font-semibold mb-6 text-center">AI-Powered Agent Orchestration</h4>
      
      <div className="flex items-center justify-between">
        {[
          { icon: FileCheck, label: "Document\nProcessed", color: "blue" },
          { icon: BrainCircuit, label: "AI\nAnalysis", color: "yellow" },
          { icon: Lightbulb, label: "Agent\nRecommendation", color: "orange" },
          { icon: Workflow, label: "Workflow\nCanvas", color: "purple" },
          { icon: Zap, label: "One-Click\nDeploy", color: "green" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2, type: "spring" }}
              className="flex flex-col items-center text-center relative"
            >
              {/* Pulsing glow for active step */}
              {i === 2 && (
                <motion.div
                  className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl -z-10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div className={`w-14 h-14 bg-${step.color}-500/20 border-2 border-${step.color}-400 rounded-xl flex items-center justify-center mb-2`}>
                <step.icon className={`w-7 h-7 text-${step.color}-400`} />
              </div>
              <span className="text-xs font-medium text-white whitespace-pre-line">{step.label}</span>
            </motion.div>
            {i < 4 && (
              <motion.div 
                className="flex-1 mx-2 relative h-6 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
              >
                <div className="w-full h-0.5 bg-gradient-to-r from-white/20 to-white/20" />
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-white shadow-lg"
                  animate={{ x: [0, 40] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    {/* Sub-Agent Types */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[
        { 
          type: "Verification Agent", 
          desc: "Auto-verify extracted patient data against existing records",
          trigger: "New patient detected",
          actions: ["Cross-reference demographics", "Validate insurance", "Check duplicates"],
          icon: CheckCircle,
          color: "green"
        },
        { 
          type: "Prior Authorization Agent", 
          desc: "Submit prior authorization for medications requiring approval",
          trigger: "Rx requires PA",
          actions: ["Check PA requirements", "Gather clinical info", "Submit to payer"],
          icon: ClipboardList,
          color: "blue"
        },
        { 
          type: "Scheduling Agent", 
          desc: "Book follow-up appointments based on extracted requirements",
          trigger: "Follow-up required",
          actions: ["Parse follow-up dates", "Check availability", "Send confirmation"],
          icon: Clock,
          color: "purple"
        },
      ].map((agent, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`bg-gradient-to-br from-${agent.color}-50 to-white rounded-xl p-4 border border-${agent.color}-200 shadow-sm`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 bg-${agent.color}-100 rounded-lg flex items-center justify-center`}>
              <agent.icon className={`w-4 h-4 text-${agent.color}-600`} />
            </div>
            <h4 className="font-semibold text-sm text-foreground">{agent.type}</h4>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{agent.desc}</p>
          
          <div className="space-y-1.5 mb-3">
            {agent.actions.map((action, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full bg-${agent.color}-400`} />
                <span className="text-foreground">{action}</span>
              </div>
            ))}
          </div>
          
          <Badge variant="outline" className={`text-xs border-${agent.color}-300 text-${agent.color}-700`}>
            Trigger: {agent.trigger}
          </Badge>
        </motion.div>
      ))}
    </div>

    {/* Popup Preview */}
    <motion.div 
      {...fadeInUp}
      className="bg-white rounded-xl p-4 border shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-violet-500" />
          <span className="font-semibold text-foreground">Agent Recommendation Popup</span>
        </div>
        <Badge className="bg-violet-100 text-violet-700">AI Suggested</Badge>
      </div>
      
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
        <p className="text-sm text-foreground mb-3">
          <strong>Based on extracted data:</strong> Prior Authorization is recommended for Ozempic.
          Would you like to deploy the Prior Auth Agent?
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700">
            <Zap className="w-3 h-3" />
            Deploy Agent
          </Button>
          <Button size="sm" variant="outline">Configure First</Button>
          <Button size="sm" variant="ghost">Dismiss</Button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Slide 9: External Data Push - ENHANCED with integration details
const ExternalPushSlide = () => (
  <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-4">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-teal-100 rounded-full border border-teal-200">
        <Send className="w-5 h-5 text-teal-600" />
        <span className="text-sm font-medium text-teal-700">External Data Integration</span>
      </div>
    </motion.div>

    {/* Integration Flow Diagram */}
    <motion.div 
      {...fadeInUp}
      className="bg-gradient-to-r from-teal-900 via-cyan-900 to-blue-900 rounded-xl p-6 border border-teal-500/30"
    >
      <h4 className="text-white font-semibold mb-6 text-center">Data Flow to External Systems</h4>
      
      <div className="flex items-center justify-between">
        {/* Source */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-16 h-20 bg-white/10 border-2 border-white/30 rounded-lg flex flex-col items-center justify-center mb-2">
            <FileCheck className="w-8 h-8 text-white mb-1" />
            <span className="text-xs text-white/60">Extracted</span>
          </div>
        </motion.div>

        {/* Animated Connection */}
        <motion.div 
          className="flex-1 mx-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-white/30 via-teal-400 to-white/30" />
          </div>
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50"
            animate={{ x: [0, 150] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Transform */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 rounded-full flex items-center justify-center mb-2">
            <RefreshCw className="w-8 h-8 text-yellow-400" />
          </div>
          <span className="text-xs text-yellow-300 font-medium">Transform</span>
        </motion.div>

        {/* Animated Connection */}
        <motion.div 
          className="flex-1 mx-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-white/30 via-cyan-400 to-white/30" />
          </div>
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            animate={{ x: [0, 150] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        </motion.div>

        {/* Destinations */}
        <div className="flex flex-col gap-2">
          {[
            { name: "EHR System", icon: Stethoscope, color: "blue" },
            { name: "Database", icon: Database, color: "green" },
            { name: "Webhook", icon: Globe, color: "purple" },
          ].map((dest, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 bg-${dest.color}-500/20 border border-${dest.color}-400/50 rounded-lg`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <dest.icon className={`w-4 h-4 text-${dest.color}-400`} />
              <span className="text-xs text-white font-medium">{dest.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Integration Methods */}
      <motion.div {...fadeInUp} className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Supported Integrations</h3>
        
        {[
          { method: "REST API", desc: "Direct API integration with any system", icon: Server, badge: "JSON/XML" },
          { method: "Webhooks", desc: "Real-time event-driven updates", icon: Zap, badge: "Real-time" },
          { method: "HL7/FHIR", desc: "Healthcare standard protocols", icon: HeartPulse, badge: "Healthcare" },
          { method: "SDK", desc: "Embed in your applications", icon: Cpu, badge: "Custom" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-3 bg-teal-50 rounded-lg border border-teal-200"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <item.icon className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{item.method}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Payload */}
      <motion.div {...fadeInUp} className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Sample Webhook Payload</h3>
        
        <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-auto max-h-52">
          <pre>{`{
  "event": "document_processed",
  "timestamp": "2024-01-07T10:30:00Z",
  "document": {
    "type": "prescription",
    "confidence": 0.96
  },
  "patient": {
    "name": "John Smith",
    "dob": "1985-03-15",
    "mrn": "MRN123456"
  },
  "medications": [{
    "name": "Metformin",
    "ndc": "12345-678-90",
    "dosage": "500mg",
    "frequency": "BID"
  }]
}`}</pre>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline">JSON</Badge>
          <Badge variant="outline">HL7 FHIR</Badge>
          <Badge variant="outline">CSV</Badge>
          <Badge variant="outline">XML</Badge>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// Slide 10: ROI & Cost Comparison
const ROISlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-100 rounded-full border border-emerald-200">
        <DollarSign className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">Return on Investment</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Traditional vs Lovable */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground text-center">Development Comparison</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* External Team */}
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-4 text-center">External Team</h4>
            <div className="space-y-3">
              {[
                { label: "Team Size", value: "5-8 devs" },
                { label: "Timeline", value: "6-12 months" },
                { label: "Cost", value: "$300K-$500K" },
                { label: "Maintenance", value: "$50K/year" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-red-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lovable + You */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-4 text-center">Lovable + 1 Person</h4>
            <div className="space-y-3">
              {[
                { label: "Team Size", value: "1 person" },
                { label: "Timeline", value: "2-4 weeks" },
                { label: "Cost", value: "$500-$2K" },
                { label: "Maintenance", value: "$100/month" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-green-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Savings */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground text-center">Savings Summary</h3>
        
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Development Cost", savings: "99%", icon: DollarSign },
              { label: "Time to Market", savings: "95%", icon: Clock },
              { label: "Team Required", savings: "85%", icon: Users },
              { label: "Ongoing Costs", savings: "90%", icon: BarChart3 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center p-4 bg-white rounded-lg shadow-sm"
              >
                <item.icon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600">{item.savings}</div>
                <div className="text-xs text-muted-foreground">{item.label} Reduction</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center"
        >
          <p className="text-amber-800 text-sm">
            <strong>Credits Used:</strong> ~2,000 Lovable credits • <strong>Value Delivered:</strong> $400K+ equivalent
          </p>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);

// Main Presentation Slides
const documentProcessingSlides: Slide[] = [
  { id: 1, title: "The Document Processing Challenge", subtitle: "Understanding the problem we're solving", animation: 'fade', content: <ProblemStatementSlide /> },
  { id: 2, title: "Current Tools: 1:1 and Less Intelligent", subtitle: "Why traditional approaches fall short", animation: 'slide', content: <CurrentToolsSlide /> },
  { id: 3, title: "Why Multi-Model Routing?", subtitle: "The right model for every document type", animation: 'zoom', content: <WhyMultiModelSlide /> },
  { id: 4, title: "Auto-Detection & Configuration", subtitle: "Zero-config document processing", animation: 'fade', content: <DocumentConfigSlide /> },
  { id: 5, title: "Two-Stage Pipeline Architecture", subtitle: "Vision AI + NLP for optimal extraction", animation: 'slide', content: <TwoStagePipelineSlide /> },
  { id: 6, title: "Complete Solution Architecture", subtitle: "End-to-end document intelligence", animation: 'zoom', content: <SolutionArchitectureSlide /> },
  { id: 7, title: "Live Demo: Prescription & Integrations", subtitle: "Real-world processing with drug database lookup", animation: 'fade', content: <DemoSlide /> },
  { id: 8, title: "Sub-Agent Follow-up Intelligence", subtitle: "AI-recommended workflow automation", animation: 'slide', content: <SubAgentSlide /> },
  { id: 9, title: "External Data Push & Integration", subtitle: "Seamless connection to your systems", animation: 'zoom', content: <ExternalPushSlide /> },
  { id: 10, title: "ROI: Lovable vs Traditional Development", subtitle: "Cost, time, and resource comparison", animation: 'fade', content: <ROISlide /> },
];

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
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
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
      toast.info('Generating PowerPoint presentation...');
      
      const pptx = new pptxgen();
      pptx.title = 'Document Processing Platform';
      pptx.author = 'Lovable AI';
      pptx.subject = 'Multi-Model AI Document Processing';
      
      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.addText('Document Processing Platform', { 
        x: 0.5, y: 2, w: '90%', h: 1,
        fontSize: 40, bold: true, color: '1e293b',
        align: 'center'
      });
      titleSlide.addText('Multi-Model AI for Intelligent Document Extraction', {
        x: 0.5, y: 3.2, w: '90%', h: 0.5,
        fontSize: 20, color: '64748b',
        align: 'center'
      });
      
      // Content slides
      documentProcessingSlides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // Slide number
        pptSlide.addText(`${index + 1} / ${documentProcessingSlides.length}`, {
          x: 9, y: 0.2, w: 1, h: 0.3,
          fontSize: 10, color: '94a3b8'
        });
        
        // Title
        pptSlide.addText(slide.title, {
          x: 0.5, y: 0.5, w: '90%', h: 0.8,
          fontSize: 28, bold: true, color: '1e293b'
        });
        
        // Subtitle
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, {
            x: 0.5, y: 1.3, w: '90%', h: 0.4,
            fontSize: 16, color: '64748b'
          });
        }
        
        // Content placeholder
        pptSlide.addText('See interactive presentation for detailed animated content', {
          x: 0.5, y: 2.5, w: '90%', h: 0.3,
          fontSize: 12, color: '94a3b8', italic: true
        });
      });
      
      // Summary slide
      const summarySlide = pptx.addSlide();
      summarySlide.addText('Key Takeaways', {
        x: 0.5, y: 0.5, w: '90%', h: 0.8,
        fontSize: 32, bold: true, color: '1e293b'
      });
      summarySlide.addText([
        { text: '• Multi-model routing for optimal accuracy\n', options: { bullet: false } },
        { text: '• Zero-configuration auto-detection\n', options: { bullet: false } },
        { text: '• Two-stage pipeline architecture\n', options: { bullet: false } },
        { text: '• Drug database integrations (DrugBank, RxNorm, NDC)\n', options: { bullet: false } },
        { text: '• Sub-agent follow-up intelligence\n', options: { bullet: false } },
        { text: '• 99% cost reduction vs traditional development', options: { bullet: false } },
      ], {
        x: 0.5, y: 1.5, w: '90%', h: 3,
        fontSize: 18, color: '334155'
      });
      
      await pptx.writeFile({ fileName: 'document-processing-presentation.pptx' });
      toast.success('PowerPoint downloaded successfully!');
    } catch (error) {
      console.error('PPT generation error:', error);
      toast.error('Failed to generate PowerPoint');
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
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Document Processing Platform
              </h1>
              <p className="text-xs text-muted-foreground">Interactive Presentation</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {currentSlide + 1} of {documentProcessingSlides.length}
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
            {isAutoplay ? 'Pause' : 'Play'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setCurrentSlide(0)} className="gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1">
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={downloadPPT} className="gap-1">
            <Download className="w-4 h-4" />
            PPT
          </Button>
          
          {onExit && (
            <Button variant="destructive" size="sm" onClick={onExit} className="gap-1">
              <X className="w-4 h-4" />
              Exit
            </Button>
          )}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className={cn(
        "relative overflow-hidden",
        isFullscreen ? "h-[calc(100vh-130px)]" : "h-[650px]"
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
            className="absolute inset-0 p-6 overflow-y-auto"
          >
            {/* Slide Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {currentSlideData.title}
              </h2>
              {currentSlideData.subtitle && (
                <p className="text-base text-muted-foreground">
                  {currentSlideData.subtitle}
                </p>
              )}
            </div>
            
            {/* Slide Content */}
            <div className="max-w-6xl mx-auto">
              {currentSlideData.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-4 border-t bg-gradient-to-r from-muted/20 via-background to-muted/20">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {/* Slide Indicators */}
        <div className="flex gap-2 overflow-x-auto max-w-md px-4 py-2">
          {documentProcessingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0",
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
