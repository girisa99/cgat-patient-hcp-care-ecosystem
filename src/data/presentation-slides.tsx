/**
 * PRESENTATION SLIDE DATA
 * Extracted from AgenticAIPresentation to improve maintainability
 * This file contains all slide content without affecting the main component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <div className="text-center text-muted-foreground">
          <p>Slide 1 content - Will be rendered by static export</p>
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
          <p>Slide 2 content - Will be rendered by static export</p>
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
