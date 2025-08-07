/**
 * Structured Presentation Data - Clean Export Ready
 * Defines slides as structured data for perfect PPT and PDF generation
 */

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  type: 'title' | 'content' | 'comparison' | 'process' | 'stats';
  content: {
    mainPoints?: string[];
    subSections?: {
      title: string;
      items: string[];
    }[];
    stats?: {
      value: string;
      label: string;
    }[];
    processSteps?: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  design: {
    backgroundColor: string;
    primaryColor: string;
    layout: 'centered' | 'two-column' | 'grid' | 'process';
  };
}

export const structuredPresentationData: SlideData[] = [
  {
    id: 1,
    title: "Agentic AI Implementation for Treatment Centers",
    subtitle: "Comprehensive AI automation platform with proven results and real-world implementation",
    type: "title",
    content: {
      mainPoints: [
        "Transform treatment center operations with comprehensive AI automation",
        "From patient intake to care coordination, delivering measurable results",
        "95% efficiency gain with 60% cost reduction",
        "24/7 AI availability with 30+ integrations"
      ],
      stats: [
        { value: "95%", label: "Efficiency Gain" },
        { value: "60%", label: "Cost Reduction" },
        { value: "24/7", label: "AI Availability" },
        { value: "30+", label: "Integrations" }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "centered"
    }
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture & Deployment System",
    subtitle: "End-to-End Agent Lifecycle Management with Multi-Channel Deployment",
    type: "content",
    content: {
      subSections: [
        {
          title: "Core Components",
          items: [
            "Agent Registry - Centralized management with version control",
            "Multi-Channel Deployment - Web, mobile, SMS, voice, social media",
            "Real-time Monitoring - Live performance metrics and analytics",
            "Enterprise Security - Advanced encryption and compliance"
          ]
        },
        {
          title: "Deployment Channels",
          items: [
            "Web Chat Integration",
            "Mobile App Support", 
            "SMS/WhatsApp Messaging",
            "Voice Call Automation",
            "Email Communication",
            "Social Media Integration",
            "API & Webhook Support"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb", 
      layout: "two-column"
    }
  },
  {
    id: 3,
    title: "Complete Agent Creation Journey Overview",
    subtitle: "End-to-End Process: Create → Test → Deploy → Monitor",
    type: "process",
    content: {
      processSteps: [
        {
          number: "1",
          title: "Setup & Configuration",
          description: "Session management, authentication, and initial preferences"
        },
        {
          number: "2", 
          title: "Canvas Design",
          description: "Visual agent creation with templates and branding"
        },
        {
          number: "3",
          title: "Actions & Connectors", 
          description: "External system integration and workflow configuration"
        },
        {
          number: "4",
          title: "Knowledge & Deploy",
          description: "Knowledge base integration and multi-channel deployment"
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "process"
    }
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Session Management, User Authentication & Multi-Step Setup Process", 
    type: "content",
    content: {
      subSections: [
        {
          title: "Core Features",
          items: [
            "Session Management - Secure session handling with auto-save and recovery",
            "User Authentication - Multi-factor authentication with role-based access", 
            "Smart Defaults - Industry-specific templates and intelligent suggestions",
            "Organization Setup - Company details, team structure, compliance requirements"
          ]
        },
        {
          title: "Setup Process Flow",
          items: [
            "Account Creation & Verification - Email verification, security setup",
            "Organization Configuration - Company details and team structure", 
            "Integration Preferences - EHR connections and API configurations",
            "Initial Testing - Validation and system readiness checks"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Complete Branding System, Canvas Architecture & Agent Creation Platform",
    type: "content", 
    content: {
      subSections: [
        {
          title: "Complete Branding & Design System",
          items: [
            "Logo for all colors - Comprehensive brand identity package",
            "Branding style guide - Complete visual identity standards",
            "Digital assets created - Professional marketing materials",
            "Brand positioning - Strategic market positioning framework",
            "Branding strategy - Long-term brand development roadmap",
            "Colors & fonts - Consistent typography and color palette"
          ]
        },
        {
          title: "Canvas Implementation Architecture",
          items: [
            "Data Layer - Secure data management and storage foundation",
            "Command Layer - Intelligent command processing and routing",
            "Rendering Engine - Real-time visual rendering and display",
            "Experience Layer - User interface and interaction management"
          ]
        },
        {
          title: "Visual Design Features",
          items: [
            "Drag-and-drop interface for creating branded AI agents",
            "Professional templates for healthcare industry",
            "Complete branding customization and logo integration",
            "Real-time preview with responsive design testing"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc", 
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Connectors",
    subtitle: "Auto-Assign Templates & External System Integration",
    type: "content",
    content: {
      subSections: [
        {
          title: "AI Template System",
          items: [
            "Auto-Assign AI Templates - Context-aware action suggestions, agent type & purpose analysis, score-based connector matching, real-time task optimization",
            "Custom Template Creation - Wizard-guided setup, dynamic configuration forms, multi-step validation, reusable action chains",
            "Task Assignment Engine - Intelligent connector assignment, type-based matching algorithm, category alignment scoring, performance monitoring"
          ]
        },
        {
          title: "AI Models Implementation",
          items: [
            "Large Language Models - GPT-4 for complex reasoning, Claude for healthcare compliance, multi-modal orchestration, context-aware routing",
            "Small Language Models - Llama 3.1 8B for efficiency, Phi-3 Mini for quick responses, Gemma 2B for lightweight tasks, edge deployment ready",
            "Vision & MCP Protocol - GPT-4V for image analysis, MCP SDK integration, OCR document processing, labeling studio workflows"
          ]
        },
        {
          title: "System Connectors",
          items: [
            "Database - Oracle, MySQL, PostgreSQL integration",
            "Messaging - Kafka, RabbitMQ, SQS support",
            "REST API - HTTP endpoints, webhook integration",
            "File System - FTP, SFTP, S3 storage connectivity"
          ]
        },
        {
          title: "Knowledge Base & Integration",
          items: [
            "Supabase Integration - Vector embeddings, real-time data, Auth",
            "RAG Implementation - Context retrieval, smart suggestions",
            "Document Auto-Creation - Automated clinical documentation, consent forms, patient education materials",
            "Secure Upload System - HIPAA-compliant document upload with automatic OCR, metadata extraction, and classification",
            "Web Crawling - Intelligent crawling of authorized websites to gather relevant information for knowledge bases"
          ]
        },
        {
          title: "Retrieval-Augmented Generation (RAG)",
          items: [
            "Vector database integration for semantic search across documents",
            "Automatic chunking and embedding of medical content",
            "Citation tracking to maintain source transparency",
            "Content approval workflows with clinical review options",
            "Version control for all knowledge base materials",
            "Comprehensive audit trails and access controls for healthcare compliance"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 7,
    title: "Knowledge Base & RAG Implementation",
    subtitle: "Comprehensive Document Management, Auto-Creation, Upload, Crawl & RAG",
    type: "content",
    content: {
      subSections: [
        {
          title: "Document Processing",
          items: [
            "Multi-format support - PDF, DOC, TXT with OCR capabilities",
            "Automated text extraction and content validation", 
            "Content approval workflows and version control",
            "Real-time knowledge updates and synchronization"
          ]
        },
        {
          title: "RAG Implementation",
          items: [
            "Vector Database Technologies - Pinecone, Weaviate, Chroma",
            "Smart Chunking - Intelligent text segmentation",
            "Hybrid Search - Semantic and keyword search combined", 
            "Context Management - Result optimization and reranking"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 8,
    title: "Advanced AI Model Selection & Optimization",
    subtitle: "Multi-Model Strategy, Performance Optimization & Cost Management",
    type: "content",
    content: {
      subSections: [
        {
          title: "Model Selection Strategy", 
          items: [
            "GPT-4 for complex reasoning and clinical decision support",
            "Claude for detailed analysis and compliance documentation",
            "Gemini for multimodal processing and real-time interactions",
            "Local models for sensitive data and offline processing"
          ]
        },
        {
          title: "Optimization Features",
          items: [
            "Dynamic model routing based on query complexity",
            "Cost optimization with intelligent model selection", 
            "Performance monitoring and automatic scaling",
            "A/B testing for model performance comparison"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column" 
    }
  },
  {
    id: 9,
    title: "Comprehensive Testing & Quality Assurance",
    subtitle: "Multi-Environment Testing, Performance Validation & Compliance Verification", 
    type: "content",
    content: {
      subSections: [
        {
          title: "Testing Framework",
          items: [
            "Automated conversation flow testing",
            "Performance benchmarking and load testing",
            "Security penetration testing and vulnerability assessment", 
            "Compliance validation for healthcare regulations"
          ]
        },
        {
          title: "Quality Metrics",
          items: [
            "Response accuracy and relevance scoring",
            "Conversation completion rate tracking",
            "User satisfaction measurement and feedback analysis",
            "System uptime and reliability monitoring"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 10,
    title: "Security, Privacy & HIPAA Compliance",
    subtitle: "Enterprise-Grade Security, Data Protection & Regulatory Compliance",
    type: "content", 
    content: {
      subSections: [
        {
          title: "Security Features",
          items: [
            "End-to-end encryption for all data transmission",
            "Multi-factor authentication and role-based access control",
            "Advanced threat detection and prevention systems",
            "Regular security audits and penetration testing"
          ]
        },
        {
          title: "Compliance Standards",
          items: [
            "HIPAA compliance with comprehensive audit trails", 
            "SOC 2 Type II certification and annual audits",
            "GDPR compliance for international data protection",
            "State-specific healthcare regulations adherence"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "two-column"
    }
  },
  {
    id: 11,
    title: "Real-World Success Stories & Case Studies",
    subtitle: "Proven Results from Treatment Centers Across the Country",
    type: "stats",
    content: {
      stats: [
        { value: "150+", label: "Treatment Centers" },
        { value: "85%", label: "Patient Satisfaction" }, 
        { value: "70%", label: "Administrative Efficiency" },
        { value: "45%", label: "Cost Savings" }
      ],
      subSections: [
        {
          title: "Success Metrics",
          items: [
            "Reduced patient wait times by 60% on average",
            "Increased treatment completion rates by 40%",
            "Improved staff productivity and job satisfaction",
            "Enhanced compliance reporting and documentation accuracy"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb", 
      layout: "grid"
    }
  },
  {
    id: 12,
    title: "ROI Analysis & Financial Benefits",
    subtitle: "Comprehensive Return on Investment with Detailed Cost-Benefit Analysis",
    type: "stats",
    content: {
      stats: [
        { value: "300%", label: "Average ROI" },
        { value: "6", label: "Months to Breakeven" },
        { value: "$50K", label: "Annual Savings" },
        { value: "24/7", label: "Cost-Effective Coverage" }
      ],
      subSections: [
        {
          title: "Cost Savings Breakdown", 
          items: [
            "Reduced staffing costs for routine inquiries and scheduling",
            "Decreased administrative overhead through automation",
            "Improved billing accuracy and faster payment processing",
            "Lower training costs with standardized AI interactions"
          ]
        }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "grid"
    }
  },
  {
    id: 13,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Strategic Planning for AI Implementation",
    type: "process",
    content: {
      processSteps: [
        {
          number: "Phase 1",
          title: "Discovery & Planning (Weeks 1-2)", 
          description: "Current workflow analysis, system integration assessment, compliance requirements review, and staff training needs evaluation"
        },
        {
          number: "Phase 2",
          title: "Pilot Development (Weeks 3-6)",
          description: "AI agent configuration, system integrations setup, knowledge base development, and security compliance configuration"
        },
        {
          number: "Phase 3",
          title: "Production Deployment (Weeks 7-8)",
          description: "Production environment setup, gradual rollout strategy, real-time monitoring activation, and support team activation"
        }
      ],
      stats: [
        { value: "8", label: "Week Implementation" },
        { value: "60%", label: "Cost Reduction" }, 
        { value: "6", label: "Month ROI" },
        { value: "24/7", label: "Support Included" }
      ]
    },
    design: {
      backgroundColor: "#f8fafc",
      primaryColor: "#2563eb",
      layout: "process"
    }
  }
];