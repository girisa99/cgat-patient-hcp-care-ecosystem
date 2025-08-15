import { useState, useCallback } from 'react';
import { JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';

interface JourneyAISuggestions {
  steps: JourneyStep[];
  isLoading: boolean;
  generateSuggestions: (useCase: string, modelType: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useJourneyAISuggestions = (): JourneyAISuggestions => {
  const [suggestions, setSuggestions] = useState<JourneyStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useCallback(async (useCase: string, modelType: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call - in real implementation, this would call Perplexity or OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedSteps = generateUseCaseSpecificSteps(useCase, modelType);
      setSuggestions(generatedSteps);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    steps: suggestions,
    isLoading,
    generateSuggestions,
    clearSuggestions
  };
};

const generateUseCaseSpecificSteps = (useCase: string, modelType: string): JourneyStep[] => {
  const lowerUseCase = useCase.toLowerCase();
  const steps: JourneyStep[] = [];

  // Healthcare-specific comprehensive suggestions
  if (lowerUseCase.includes('healthcare') || lowerUseCase.includes('medical') || lowerUseCase.includes('patient')) {
    steps.push(
      {
        id: `ai-step-${Date.now()}-1`,
        title: 'Patient Authentication & Identity Verification',
        description: 'Secure patient identity verification with multi-factor authentication and biometric validation',
        type: 'validation',
        connectors: ['ID Verification Service', 'Biometric API', 'MFA Provider', 'Patient Portal'],
        actions: ['Identity Verification', 'Biometric Match', 'MFA Challenge', 'Security Audit'],
        requirements: ['HIPAA Compliance', 'Identity Documents', 'Biometric Database', 'Security Protocols'],
        estimatedDuration: 4,
        dependencies: ['Patient Portal Access']
      },
      {
        id: `ai-step-${Date.now()}-2`,
        title: 'Comprehensive Patient Data Intake',
        description: 'Collect and validate complete patient information, medical history, medications, and insurance details',
        type: 'action',
        connectors: ['EHR Integration', 'Insurance API', 'Pharmacy Database', 'Medical History Service'],
        actions: ['Data Collection', 'Medical History Review', 'Insurance Verification', 'Duplicate Detection', 'HIPAA Compliance Check'],
        requirements: ['HIPAA Compliance', 'Data Encryption', 'Audit Logging', 'Data Quality Validation'],
        estimatedDuration: 8,
        dependencies: ['Patient Authentication & Identity Verification']
      },
      {
        id: `ai-step-${Date.now()}-3`,
        title: 'Clinical Risk Assessment',
        description: 'AI-powered analysis of patient data to identify clinical risks and health indicators',
        type: 'decision',
        connectors: ['Risk Assessment Engine', 'Clinical Guidelines API', 'Medical Knowledge Base'],
        actions: ['Risk Score Calculation', 'Comorbidity Analysis', 'Alert Generation', 'Severity Classification'],
        requirements: ['Clinical Algorithms', 'Medical Knowledge Base', 'Risk Models', 'Real-time Processing'],
        estimatedDuration: 6,
        dependencies: ['Comprehensive Patient Data Intake']
      },
      {
        id: `ai-step-${Date.now()}-4`,
        title: 'Treatment Plan Recommendation',
        description: 'Generate evidence-based treatment recommendations using clinical guidelines and patient context',
        type: 'decision',
        connectors: ['Clinical Guidelines API', 'Drug Database', 'Treatment Protocol Engine', 'Evidence Base'],
        actions: ['Treatment Options Analysis', 'Drug Interaction Check', 'Guideline Matching', 'Personalization'],
        requirements: ['Clinical Guidelines', 'Drug Information', 'Evidence Base', 'Personalization Engine'],
        estimatedDuration: 10,
        dependencies: ['Clinical Risk Assessment']
      },
      {
        id: `ai-step-${Date.now()}-5`,
        title: 'Care Team Coordination',
        description: 'Coordinate care team members and schedule appropriate interventions',
        type: 'integration',
        connectors: ['Staff Scheduling', 'Care Team Directory', 'Resource Management', 'Communication Hub'],
        actions: ['Team Assignment', 'Schedule Coordination', 'Resource Allocation', 'Communication Setup'],
        requirements: ['Staff Directory', 'Scheduling System', 'Resource Database', 'Communication Tools'],
        estimatedDuration: 5,
        dependencies: ['Treatment Plan Recommendation']
      },
      {
        id: `ai-step-${Date.now()}-6`,
        title: 'Provider & Patient Notification System',
        description: 'Multi-channel notification system for providers and patients with priority-based delivery',
        type: 'integration',
        connectors: ['SMS Gateway', 'Email Service', 'Push Notifications', 'Paging System', 'Patient App'],
        actions: ['Priority Classification', 'Multi-channel Delivery', 'Delivery Confirmation', 'Escalation Management'],
        requirements: ['Real-time Delivery', 'Escalation Rules', 'Audit Trail', 'Patient Preferences'],
        estimatedDuration: 4,
        dependencies: ['Care Team Coordination']
      },
      {
        id: `ai-step-${Date.now()}-7`,
        title: 'Clinical Documentation & Compliance',
        description: 'Automated clinical documentation generation with regulatory compliance validation',
        type: 'action',
        connectors: ['Documentation Engine', 'Compliance Checker', 'Audit System', 'Template Library'],
        actions: ['Auto-Documentation', 'Compliance Validation', 'Quality Review', 'Audit Trail Generation'],
        requirements: ['Documentation Templates', 'Compliance Rules', 'Quality Standards', 'Audit Requirements'],
        estimatedDuration: 6,
        dependencies: ['Provider & Patient Notification System']
      },
      {
        id: `ai-step-${Date.now()}-8`,
        title: 'Outcome Tracking & Analytics',
        description: 'Monitor patient outcomes and generate insights for continuous improvement',
        type: 'integration',
        connectors: ['Analytics Engine', 'Outcome Database', 'Reporting Service', 'Dashboard API'],
        actions: ['Outcome Monitoring', 'Performance Analytics', 'Insight Generation', 'Report Creation'],
        requirements: ['Analytics Platform', 'Outcome Metrics', 'Reporting Tools', 'Data Visualization'],
        estimatedDuration: 7,
        dependencies: ['Clinical Documentation & Compliance']
      }
    );
  }

  // Insurance/Prior Authorization comprehensive workflow
  if (lowerUseCase.includes('insurance') || lowerUseCase.includes('authorization') || lowerUseCase.includes('benefits') || lowerUseCase.includes('claims')) {
    steps.push(
      {
        id: `ai-step-${Date.now()}-10`,
        title: 'Patient Insurance Data Collection',
        description: 'Comprehensive collection of insurance information including primary, secondary, and tertiary coverage',
        type: 'action',
        connectors: ['Insurance Card Scanner', 'Patient Portal', 'Insurance Database', 'Verification Service'],
        actions: ['Card Image Processing', 'Data Extraction', 'Coverage Hierarchy', 'Policy Validation'],
        requirements: ['OCR Technology', 'Insurance Database Access', 'Data Validation Rules'],
        estimatedDuration: 5,
        dependencies: ['Patient Authentication']
      },
      {
        id: `ai-step-${Date.now()}-11`,
        title: 'Multi-Payer Eligibility Verification',
        description: 'Real-time verification of patient eligibility across all insurance coverage layers',
        type: 'validation',
        connectors: ['Primary Payer API', 'Secondary Payer API', 'Clearinghouse', 'Benefits Database'],
        actions: ['Primary Coverage Check', 'Secondary Coverage Verification', 'Coordination of Benefits', 'Coverage Gap Analysis'],
        requirements: ['Multi-Payer Connections', 'Real-time Processing', 'COB Logic', 'Error Handling'],
        estimatedDuration: 6,
        dependencies: ['Patient Insurance Data Collection']
      },
      {
        id: `ai-step-${Date.now()}-12`,
        title: 'Benefits Analysis & Cost Estimation',
        description: 'Detailed analysis of coverage benefits and patient cost estimation',
        type: 'decision',
        connectors: ['Benefits Engine', 'Cost Calculator', 'Fee Schedule', 'Deductible Tracker'],
        actions: ['Benefit Coverage Analysis', 'Deductible Calculation', 'Co-pay Determination', 'Out-of-Pocket Estimation'],
        requirements: ['Benefits Rules Engine', 'Cost Calculation Logic', 'Fee Schedules', 'Patient History'],
        estimatedDuration: 7,
        dependencies: ['Multi-Payer Eligibility Verification']
      },
      {
        id: `ai-step-${Date.now()}-13`,
        title: 'Prior Authorization Requirements Analysis',
        description: 'AI-powered analysis to determine prior authorization requirements for proposed treatments',
        type: 'decision',
        connectors: ['PA Rules Engine', 'Medical Necessity Database', 'Clinical Guidelines', 'Payer Policies'],
        actions: ['PA Requirement Check', 'Medical Necessity Review', 'Policy Matching', 'Documentation Requirements'],
        requirements: ['PA Rules Database', 'Clinical Criteria', 'Payer Policy Database', 'Medical Necessity Logic'],
        estimatedDuration: 8,
        dependencies: ['Benefits Analysis & Cost Estimation']
      },
      {
        id: `ai-step-${Date.now()}-14`,
        title: 'Automated Prior Authorization Generation',
        description: 'Generate complete prior authorization requests with clinical documentation and supporting evidence',
        type: 'action',
        connectors: ['Document Generator', 'Clinical Data API', 'Evidence Repository', 'Form Builder'],
        actions: ['Clinical Summary Generation', 'Supporting Documentation Collection', 'Form Population', 'Evidence Compilation'],
        requirements: ['Clinical Documentation', 'Template Library', 'Evidence Database', 'Form Standards'],
        estimatedDuration: 12,
        dependencies: ['Prior Authorization Requirements Analysis']
      },
      {
        id: `ai-step-${Date.now()}-15`,
        title: 'Multi-Channel PA Submission',
        description: 'Submit prior authorization requests through multiple channels with tracking and confirmation',
        type: 'integration',
        connectors: ['Payer Portal Integration', 'EDI Gateway', 'Fax Service', 'Email Gateway'],
        actions: ['Portal Submission', 'EDI Transaction', 'Backup Submission', 'Confirmation Receipt'],
        requirements: ['Portal Credentials', 'EDI Capability', 'Backup Channels', 'Tracking System'],
        estimatedDuration: 4,
        dependencies: ['Automated Prior Authorization Generation']
      },
      {
        id: `ai-step-${Date.now()}-16`,
        title: 'Authorization Status Monitoring & Management',
        description: 'Continuous monitoring of authorization status with automated follow-up and appeal management',
        type: 'integration',
        connectors: ['Status Polling Service', 'Alert System', 'Appeal Generator', 'Workflow Engine'],
        actions: ['Automated Status Checks', 'Response Processing', 'Denial Analysis', 'Appeal Preparation'],
        requirements: ['Polling System', 'Status Processing Logic', 'Appeal Templates', 'Escalation Rules'],
        estimatedDuration: 8,
        dependencies: ['Multi-Channel PA Submission']
      },
      {
        id: `ai-step-${Date.now()}-17`,
        title: 'Claims Processing & Revenue Cycle',
        description: 'Integrated claims processing with revenue cycle management and payment tracking',
        type: 'integration',
        connectors: ['Claims Processing Engine', 'Payment Tracker', 'Denial Management', 'Revenue Analytics'],
        actions: ['Claims Generation', 'Submission Processing', 'Payment Posting', 'Denial Handling'],
        requirements: ['Claims Engine', 'Payment Processing', 'Denial Workflows', 'Financial Reporting'],
        estimatedDuration: 10,
        dependencies: ['Authorization Status Monitoring & Management']
      }
    );
  }

  // Customer Support comprehensive workflow
  if (lowerUseCase.includes('customer') || lowerUseCase.includes('support') || lowerUseCase.includes('service') || lowerUseCase.includes('help')) {
    steps.push(
      {
        id: `ai-step-${Date.now()}-20`,
        title: 'Multi-Channel Input Processing',
        description: 'Process customer inquiries from email, chat, phone, social media, and other channels',
        type: 'action',
        connectors: ['Email Parser', 'Chat API', 'Voice Recognition', 'Social Media Monitor', 'Unified Inbox'],
        actions: ['Channel Detection', 'Content Extraction', 'Media Processing', 'Channel Routing'],
        requirements: ['Multi-channel Integration', 'Content Processing', 'Media Support', 'Routing Logic'],
        estimatedDuration: 3,
        dependencies: ['Customer Communication']
      },
      {
        id: `ai-step-${Date.now()}-21`,
        title: 'Customer Identity & History Lookup',
        description: 'Identify customer and retrieve complete interaction history and context',
        type: 'validation',
        connectors: ['Customer Database', 'CRM Integration', 'Identity Service', 'History API'],
        actions: ['Customer Identification', 'History Retrieval', 'Context Building', 'Profile Analysis'],
        requirements: ['Customer Database', 'Identity Matching', 'History Storage', 'Privacy Compliance'],
        estimatedDuration: 4,
        dependencies: ['Multi-Channel Input Processing']
      },
      {
        id: `ai-step-${Date.now()}-22`,
        title: 'Advanced Query Analysis & Intent Detection',
        description: 'AI-powered analysis of customer queries with sentiment, intent, urgency, and complexity assessment',
        type: 'decision',
        connectors: ['NLP Engine', 'Sentiment Analysis', 'Intent Classifier', 'Complexity Analyzer', 'Emotion Detection'],
        actions: ['Intent Classification', 'Sentiment Analysis', 'Urgency Assessment', 'Complexity Scoring', 'Emotion Recognition'],
        requirements: ['Advanced NLP Models', 'Multi-language Support', 'Context Understanding', 'Confidence Scoring'],
        estimatedDuration: 5,
        dependencies: ['Customer Identity & History Lookup']
      },
      {
        id: `ai-step-${Date.now()}-23`,
        title: 'Intelligent Knowledge Base Search',
        description: 'Semantic search across knowledge base, FAQs, documentation, and previous solutions',
        type: 'action',
        connectors: ['Vector Database', 'Semantic Search', 'FAQ Database', 'Solution Repository', 'Content Ranker'],
        actions: ['Semantic Search', 'Solution Ranking', 'Context Matching', 'Relevance Scoring', 'Multi-source Aggregation'],
        requirements: ['Vector Database', 'Search Optimization', 'Content Quality', 'Ranking Algorithms'],
        estimatedDuration: 4,
        dependencies: ['Advanced Query Analysis & Intent Detection']
      },
      {
        id: `ai-step-${Date.now()}-24`,
        title: 'Escalation & Routing Decision',
        description: 'Intelligent routing decision based on complexity, urgency, and agent availability',
        type: 'decision',
        connectors: ['Routing Engine', 'Agent Management', 'Skill Matcher', 'Queue Management'],
        actions: ['Complexity Assessment', 'Agent Matching', 'Queue Assignment', 'Escalation Decision'],
        requirements: ['Routing Rules', 'Agent Skills Database', 'Queue Management', 'Escalation Criteria'],
        estimatedDuration: 3,
        dependencies: ['Intelligent Knowledge Base Search']
      },
      {
        id: `ai-step-${Date.now()}-25`,
        title: 'Automated Response Generation & Personalization',
        description: 'Generate contextual, personalized responses with brand voice and customer preferences',
        type: 'action',
        connectors: ['LLM API', 'Template Engine', 'Personalization Service', 'Brand Voice Engine', 'Translation Service'],
        actions: ['Response Generation', 'Personalization', 'Brand Voice Application', 'Quality Validation', 'Multi-language Support'],
        requirements: ['Language Models', 'Personalization Data', 'Brand Guidelines', 'Quality Standards'],
        estimatedDuration: 6,
        dependencies: ['Escalation & Routing Decision']
      },
      {
        id: `ai-step-${Date.now()}-26`,
        title: 'Multi-Channel Response Delivery',
        description: 'Deliver responses through appropriate channels with delivery confirmation and tracking',
        type: 'integration',
        connectors: ['Email Service', 'Chat API', 'SMS Gateway', 'Push Notifications', 'Social Media APIs'],
        actions: ['Channel Selection', 'Message Formatting', 'Delivery Tracking', 'Receipt Confirmation'],
        requirements: ['Channel APIs', 'Message Formatting', 'Delivery Tracking', 'Error Handling'],
        estimatedDuration: 3,
        dependencies: ['Automated Response Generation & Personalization']
      },
      {
        id: `ai-step-${Date.now()}-27`,
        title: 'Customer Satisfaction & Feedback Collection',
        description: 'Collect customer satisfaction feedback and sentiment analysis for continuous improvement',
        type: 'integration',
        connectors: ['Survey Engine', 'Feedback Collector', 'Sentiment Tracker', 'Analytics Platform'],
        actions: ['Satisfaction Survey', 'Feedback Collection', 'Sentiment Tracking', 'Response Analysis'],
        requirements: ['Survey Tools', 'Feedback Systems', 'Analytics Platform', 'Reporting Tools'],
        estimatedDuration: 4,
        dependencies: ['Multi-Channel Response Delivery']
      },
      {
        id: `ai-step-${Date.now()}-28`,
        title: 'Performance Analytics & Optimization',
        description: 'Analyze support performance metrics and optimize workflows for better customer experience',
        type: 'integration',
        connectors: ['Analytics Engine', 'Performance Tracker', 'Optimization Engine', 'Dashboard API'],
        actions: ['Performance Analysis', 'Trend Identification', 'Optimization Suggestions', 'Report Generation'],
        requirements: ['Analytics Platform', 'Performance Metrics', 'Optimization Rules', 'Reporting Tools'],
        estimatedDuration: 7,
        dependencies: ['Customer Satisfaction & Feedback Collection']
      }
    );
  }

  // Document Processing comprehensive workflow
  if (lowerUseCase.includes('document') || lowerUseCase.includes('processing') || lowerUseCase.includes('ocr') || lowerUseCase.includes('extraction')) {
    steps.push(
      {
        id: `ai-step-${Date.now()}-30`,
        title: 'Multi-Source Document Intake',
        description: 'Accept documents from multiple sources including upload, email, fax, API, and scanning',
        type: 'action',
        connectors: ['File Upload Service', 'Email Parser', 'Fax Gateway', 'Scanner Integration', 'API Endpoint'],
        actions: ['Multi-source Collection', 'Format Detection', 'Source Identification', 'Initial Classification'],
        requirements: ['Multi-source Support', 'Format Recognition', 'Source Tracking', 'Security Protocols'],
        estimatedDuration: 4,
        dependencies: ['Document Source']
      },
      {
        id: `ai-step-${Date.now()}-31`,
        title: 'Document Security & Validation',
        description: 'Comprehensive security scanning and document validation with authenticity verification',
        type: 'validation',
        connectors: ['Security Scanner', 'Virus Detection', 'Authenticity Checker', 'Format Validator', 'Metadata Analyzer'],
        actions: ['Security Scanning', 'Virus Detection', 'Authenticity Verification', 'Format Validation', 'Metadata Extraction'],
        requirements: ['Security Tools', 'Validation Rules', 'Authenticity Database', 'Format Standards'],
        estimatedDuration: 5,
        dependencies: ['Multi-Source Document Intake']
      },
      {
        id: `ai-step-${Date.now()}-32`,
        title: 'AI-Powered Document Classification',
        description: 'Intelligent document type classification using computer vision and NLP',
        type: 'decision',
        connectors: ['Computer Vision API', 'Document Classifier', 'Template Matcher', 'Content Analyzer'],
        actions: ['Visual Classification', 'Content Analysis', 'Template Matching', 'Confidence Scoring'],
        requirements: ['Classification Models', 'Template Library', 'Training Data', 'Confidence Thresholds'],
        estimatedDuration: 6,
        dependencies: ['Document Security & Validation']
      },
      {
        id: `ai-step-${Date.now()}-33`,
        title: 'Advanced OCR & Text Extraction',
        description: 'High-accuracy OCR with handwriting recognition, table extraction, and layout analysis',
        type: 'action',
        connectors: ['Advanced OCR Engine', 'Handwriting Recognition', 'Table Extractor', 'Layout Analyzer'],
        actions: ['Text Recognition', 'Handwriting Processing', 'Table Extraction', 'Layout Analysis', 'Quality Assessment'],
        requirements: ['Advanced OCR Technology', 'Handwriting Models', 'Table Recognition', 'Layout Understanding'],
        estimatedDuration: 8,
        dependencies: ['AI-Powered Document Classification']
      },
      {
        id: `ai-step-${Date.now()}-34`,
        title: 'Intelligent Data Extraction & Structuring',
        description: 'Extract structured data using field-specific models and business logic',
        type: 'action',
        connectors: ['Data Extraction Engine', 'Field Recognizer', 'Validation Service', 'Structure Builder'],
        actions: ['Field Extraction', 'Data Structuring', 'Relationship Mapping', 'Entity Recognition'],
        requirements: ['Extraction Models', 'Field Definitions', 'Validation Rules', 'Business Logic'],
        estimatedDuration: 10,
        dependencies: ['Advanced OCR & Text Extraction']
      },
      {
        id: `ai-step-${Date.now()}-35`,
        title: 'Multi-Level Data Validation',
        description: 'Comprehensive data validation using business rules, external APIs, and quality scoring',
        type: 'validation',
        connectors: ['Validation Engine', 'External APIs', 'Business Rules Engine', 'Quality Scorer'],
        actions: ['Field Validation', 'Cross-reference Check', 'Business Rule Application', 'Quality Assessment'],
        requirements: ['Validation Rules', 'External Data Sources', 'Business Logic', 'Quality Standards'],
        estimatedDuration: 7,
        dependencies: ['Intelligent Data Extraction & Structuring']
      },
      {
        id: `ai-step-${Date.now()}-36`,
        title: 'Exception Handling & Human Review Queue',
        description: 'Intelligent exception handling with human review workflow for low-confidence extractions',
        type: 'decision',
        connectors: ['Exception Handler', 'Review Queue', 'Workflow Engine', 'Notification Service'],
        actions: ['Exception Detection', 'Queue Assignment', 'Review Routing', 'Escalation Management'],
        requirements: ['Exception Rules', 'Review Workflows', 'Queue Management', 'Human Review Interface'],
        estimatedDuration: 5,
        dependencies: ['Multi-Level Data Validation']
      },
      {
        id: `ai-step-${Date.now()}-37`,
        title: 'Data Integration & System Updates',
        description: 'Integrate processed data into target systems with transaction management and rollback',
        type: 'integration',
        connectors: ['Database Connector', 'API Gateway', 'Transaction Manager', 'Sync Service'],
        actions: ['Data Integration', 'System Updates', 'Transaction Management', 'Sync Verification'],
        requirements: ['Database Access', 'API Credentials', 'Transaction Support', 'Error Recovery'],
        estimatedDuration: 6,
        dependencies: ['Exception Handling & Human Review Queue']
      },
      {
        id: `ai-step-${Date.now()}-38`,
        title: 'Audit Trail & Compliance Reporting',
        description: 'Generate comprehensive audit trails and compliance reports for processed documents',
        type: 'integration',
        connectors: ['Audit System', 'Compliance Engine', 'Report Generator', 'Archive Service'],
        actions: ['Audit Trail Creation', 'Compliance Validation', 'Report Generation', 'Document Archival'],
        requirements: ['Audit Standards', 'Compliance Rules', 'Reporting Templates', 'Archive Storage'],
        estimatedDuration: 4,
        dependencies: ['Data Integration & System Updates']
      }
    );
  }

  // Add model-specific enhancements
  if (modelType === 'llm') {
    steps.forEach(step => {
      step.actions?.push('Natural Language Processing', 'Context Understanding');
      step.requirements?.push('Language Model API', 'Context Management');
    });
  }

  if (modelType === 'vision') {
    steps.forEach(step => {
      if (step.type === 'validation' || step.type === 'action') {
        step.actions?.push('Image Analysis', 'Visual Recognition');
        step.requirements?.push('Computer Vision API', 'Image Processing');
      }
    });
  }

  if (modelType === 'mcp') {
    steps.forEach(step => {
      step.actions?.push('Multi-Modal Processing', 'Context Persistence');
      step.requirements?.push('MCP Server', 'Context Database');
    });
  }

  // Ensure we have at least some default steps if nothing matches
  if (steps.length === 0) {
    steps.push(
      {
        id: `ai-step-${Date.now()}-default-1`,
        title: 'Input Processing',
        description: 'Process and validate incoming user input or data',
        type: 'action',
        connectors: ['Input Validation', 'Data Parser'],
        actions: ['Input Validation', 'Data Transformation', 'Error Handling'],
        requirements: ['Input Validation', 'Error Handling'],
        estimatedDuration: 3,
        dependencies: []
      },
      {
        id: `ai-step-${Date.now()}-default-2`,
        title: 'Business Logic Processing',
        description: 'Apply business rules and logic to processed input',
        type: 'decision',
        connectors: ['Business Rules Engine', 'Decision Logic'],
        actions: ['Rule Application', 'Decision Making', 'Result Generation'],
        requirements: ['Business Rules', 'Logic Engine'],
        estimatedDuration: 5,
        dependencies: ['Input Processing']
      },
      {
        id: `ai-step-${Date.now()}-default-3`,
        title: 'Output Generation',
        description: 'Generate and deliver output based on processing results',
        type: 'integration',
        connectors: ['Output Service', 'Delivery Channel'],
        actions: ['Output Formatting', 'Delivery', 'Confirmation'],
        requirements: ['Output Templates', 'Delivery Channels'],
        estimatedDuration: 3,
        dependencies: ['Business Logic Processing']
      }
    );
  }

  return steps;
};