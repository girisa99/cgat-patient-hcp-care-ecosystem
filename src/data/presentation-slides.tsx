/**
 * PRESENTATION SLIDE DATA
 * Extracted from AgenticAIPresentation to improve maintainability
 * This file contains all slide content without affecting the main component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, MessageSquare, Zap, Cloud, Globe, FileText } from 'lucide-react';

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

export const presentationSlides: Slide[] = [
  {
    id: 1,
    title: "Agentic AI Implementation for Treatment Centers",
    subtitle: "Comprehensive AI automation platform with proven results and real-world implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your treatment center operations with comprehensive AI automation. 
            From patient intake to care coordination, our platform delivers measurable results.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Data Integration</h3>
              <p className="text-muted-foreground">
                Seamless integration with existing EHR systems and databases
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Conversations</h3>
              <p className="text-muted-foreground">
                Natural language processing for patient interactions
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Automation</h3>
              <p className="text-muted-foreground">
                Streamlined workflows and automated processes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Efficiency Gain</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">60%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Availability</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">30+</div>
            <div className="text-sm text-muted-foreground">Integrations</div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture & Deployment System",
    subtitle: "End-to-End Agent Lifecycle Management with Multi-Channel Deployment & Advanced Features",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 2 content - Full architecture details</p>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Complete Agent Creation Journey Overview",
    subtitle: "End-to-End Process: Create → Test → Deploy → Monitor with Advanced Features",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 3 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Session Management, User Authentication & Multi-Step Setup Process",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 4 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Agent Creation, Template System, Use Cases & Complete Branding Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 5 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Connectors",
    subtitle: "Auto-Assign Templates & External System Integration",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 6 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Knowledge Base & RAG Implementation",
    subtitle: "Comprehensive Document Management, Auto-Creation, Upload, Crawl & RAG for Content Approval",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 7 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Multi-Channel Deployment System",
    subtitle: "Complete Implementation with Advanced Features, Automation & Enterprise-Grade Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 8 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "AI Models, MCP Protocol & Knowledge Base Implementation",
    subtitle: "Complete AI Infrastructure with RAG, Model Selection & Context Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 9 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Template Configuration & AI Automation Implementation",
    subtitle: "Complete Template System with Actions, Tasks & Intelligent Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 10 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "Advanced AI Models & Multi-Modal Capabilities",
    subtitle: "Complete AI Infrastructure with Vision, Voice, Text Processing & Live Agents",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 11 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 12,
    title: "Current Implementation & Enterprise Features",
    subtitle: "Complete System Overview with Advanced Agent Management & Multi-Channel Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 12 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 14,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Strategic Planning for AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>Slide 13 content - Will be rendered by static export</p>
        </div>
      </div>
    ),
    animation: 'slide'
  }
];

// Export a function to get slides dynamically (future enhancement)
export const getSlides = (): Slide[] => {
  return presentationSlides;
};

// Utility functions for slide management
export const getSlideById = (id: number): Slide | undefined => {
  return presentationSlides.find(slide => slide.id === id);
};

export const getTotalSlides = (): number => {
  return presentationSlides.length;
};
