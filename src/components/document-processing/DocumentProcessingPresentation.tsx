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
  ExternalLink
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

// Slide 3: Why Multi-Model Routing
const WhyMultiModelSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
        <BrainCircuit className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-700">Intelligent Routing</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Why Different Models */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Why Different Models Excel at Different Tasks</h3>
        
        <div className="space-y-3">
          {[
            { model: "Claude 3.5 Sonnet", task: "Complex medical documents", color: "orange", reason: "Superior reasoning & context" },
            { model: "GPT-4o Vision", task: "Handwritten prescriptions", color: "green", reason: "Best handwriting recognition" },
            { model: "Gemini 1.5 Flash", task: "Structured forms", color: "blue", reason: "Fast & cost-effective" },
            { model: "Gemini 2.5 Pro", task: "Medical imaging", color: "indigo", reason: "Multi-modal excellence" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`p-4 bg-${item.color}-50 rounded-lg border border-${item.color}-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={`bg-${item.color}-100 text-${item.color}-800`}>{item.model}</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{item.task}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.reason}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Multi-Model Benefits</h3>
        
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Target, label: "95%+ Accuracy", desc: "Best model for each task" },
              { icon: DollarSign, label: "60% Cost Savings", desc: "Optimize model selection" },
              { icon: Zap, label: "3x Faster", desc: "Parallel processing" },
              { icon: Shield, label: "Zero Config", desc: "Auto-detection" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="font-bold text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-green-800 text-sm">
              <strong>Smart Routing:</strong> AI analyzes document characteristics and automatically 
              routes to the optimal model for highest accuracy at lowest cost.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
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

// Slide 7: Demo Screenshots
const DemoSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-100 rounded-full border border-cyan-200">
        <Presentation className="w-5 h-5 text-cyan-600" />
        <span className="text-sm font-medium text-cyan-700">Live Demo</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demo Cards */}
      {[
        { title: "Prescription Processing", desc: "Handwritten Rx with auto-field detection", icon: FileText, screens: ["Upload", "Classify", "Extract", "Validate"] },
        { title: "Patient Onboarding", desc: "Multi-document intake automation", icon: Users, screens: ["ID Scan", "Insurance", "Forms", "Complete"] },
        { title: "Sub-Agent Recommendations", desc: "AI suggests follow-up agents", icon: Bot, screens: ["Analyze", "Recommend", "Configure", "Deploy"] },
        { title: "External Data Push", desc: "Webhook integration with EHR", icon: Send, screens: ["Extract", "Transform", "Validate", "Push"] },
      ].map((demo, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <demo.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{demo.title}</h4>
              <p className="text-xs text-muted-foreground">{demo.desc}</p>
            </div>
          </div>
          
          {/* Mini flow */}
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
            {demo.screens.map((screen, j) => (
              <React.Fragment key={j}>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs font-bold text-primary">{j + 1}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{screen}</span>
                </div>
                {j < demo.screens.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div {...fadeInUp} className="text-center">
      <Button variant="outline" className="gap-2">
        <ExternalLink className="w-4 h-4" />
        View Live Demo
      </Button>
    </motion.div>
  </motion.div>
);

// Slide 8: Sub-Agent Follow-up
const SubAgentSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-violet-100 rounded-full border border-violet-200">
        <Bot className="w-5 h-5 text-violet-600" />
        <span className="text-sm font-medium text-violet-700">Sub-Agent Intelligence</span>
      </div>
    </motion.div>

    {/* Flow */}
    <motion.div {...fadeInUp} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
      <div className="flex items-center justify-between">
        {[
          { icon: FileCheck, label: "Document Processed", color: "blue" },
          { icon: Lightbulb, label: "AI Analysis", color: "yellow" },
          { icon: Bot, label: "Agent Recommendation", color: "violet" },
          { icon: Workflow, label: "Workflow Canvas", color: "purple" },
          { icon: Zap, label: "One-Click Deploy", color: "green" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center mb-2`}>
                <step.icon className={`w-6 h-6 text-${step.color}-600`} />
              </div>
              <span className="text-xs font-medium text-foreground">{step.label}</span>
            </motion.div>
            {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[
        { type: "Verification Agent", desc: "Auto-verify extracted patient data against existing records", trigger: "New patient detected" },
        { type: "Prior Auth Agent", desc: "Submit prior authorization for medications", trigger: "Rx requires PA" },
        { type: "Scheduling Agent", desc: "Book follow-up appointment based on document", trigger: "Follow-up required" },
      ].map((agent, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-violet-500" />
            <h4 className="font-semibold text-sm text-foreground">{agent.type}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{agent.desc}</p>
          <Badge variant="outline" className="text-xs">
            Trigger: {agent.trigger}
          </Badge>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Slide 9: External Data Push
const ExternalPushSlide = () => (
  <motion.div className="space-y-8" variants={staggerContainer} initial="initial" animate="animate">
    <motion.div {...fadeInUp} className="text-center mb-6">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-teal-100 rounded-full border border-teal-200">
        <Send className="w-5 h-5 text-teal-600" />
        <span className="text-sm font-medium text-teal-700">Data Integration</span>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Integration Methods */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Push Methods</h3>
        
        {[
          { method: "REST API", desc: "Direct API integration with any system", icon: Database },
          { method: "Webhooks", desc: "Real-time event-driven updates", icon: Zap },
          { method: "HL7/FHIR", desc: "Healthcare standard protocols", icon: Shield },
          { method: "SDK", desc: "Embed in your applications", icon: Cpu },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <item.icon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{item.method}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Payload */}
      <motion.div {...fadeInUp} className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Sample Output</h3>
        
        <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-auto max-h-64">
          <pre>{`// Webhook payload to EHR
{
  "event": "document_processed",
  "timestamp": "2024-01-07T10:30:00Z",
  "document": {
    "type": "prescription",
    "confidence": 0.96
  },
  "patient": {
    "name": "John Smith",
    "dob": "1985-03-15",
    "mrn": "MRN-12345"
  },
  "medications": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "BID"
    }
  ],
  "provider": {
    "npi": "1234567890",
    "name": "Dr. Sarah Johnson"
  }
}`}</pre>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline">JSON</Badge>
          <Badge variant="outline">HL7 FHIR</Badge>
          <Badge variant="outline">CSV</Badge>
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
  { id: 3, title: "Why Multi-Model Routing?", subtitle: "The right model for every document", animation: 'zoom', content: <WhyMultiModelSlide /> },
  { id: 4, title: "Auto-Detection & Configuration", subtitle: "Zero-config document processing", animation: 'fade', content: <DocumentConfigSlide /> },
  { id: 5, title: "Two-Stage Pipeline Architecture", subtitle: "Vision AI + NLP for optimal extraction", animation: 'slide', content: <TwoStagePipelineSlide /> },
  { id: 6, title: "Complete Solution Architecture", subtitle: "End-to-end document intelligence", animation: 'zoom', content: <SolutionArchitectureSlide /> },
  { id: 7, title: "Live Demo: Real-World Examples", subtitle: "See the platform in action", animation: 'fade', content: <DemoSlide /> },
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
        pptSlide.addText('See interactive presentation for detailed content', {
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
        isFullscreen ? "h-[calc(100vh-130px)]" : "h-[600px]"
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
            className="absolute inset-0 p-8 overflow-y-auto"
          >
            {/* Slide Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentSlideData.title}
              </h2>
              {currentSlideData.subtitle && (
                <p className="text-lg text-muted-foreground">
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
