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
      const res = await fetch(`https://ithspbabhmdntioslfqe.functions.supabase.co/generate-journey-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCase, modelType })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to generate suggestions');
      }
      const steps = Array.isArray(data?.steps) ? data.steps : [];
      setSuggestions(steps);
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

const generateComprehensiveWorkflow = (useCase: string, modelType: string): JourneyStep[] => {
  const baseId = Date.now();
  
  // Generate 10-12 comprehensive steps for ANY use case
  const steps: JourneyStep[] = [
    {
      id: `ai-step-${baseId}-1`,
      title: 'Requirements Analysis & Stakeholder Identification',
      description: `Comprehensive analysis of ${useCase} requirements with stakeholder mapping and success criteria definition`,
      type: 'validation',
      connectors: ['Requirements Engine', 'Stakeholder Database', 'Analysis Tools', 'Documentation System'],
      actions: ['Requirement Gathering', 'Stakeholder Analysis', 'Success Criteria Definition', 'Risk Assessment', 'Resource Planning'],
      requirements: ['Business Analysis Framework', 'Stakeholder Directory', 'Requirements Templates', 'Risk Management'],
      stakeholders: ['Business Analyst', 'Project Manager', 'Domain Expert', 'End Users', 'Executive Sponsor'],
      businessValue: 'Establishes clear foundation and alignment for project success',
      riskLevel: 'medium',
      automationLevel: 'semi-automated',
      estimatedDuration: 8,
      dependencies: []
    },
    {
      id: `ai-step-${baseId}-2`,
      title: 'Data Collection & Input Validation',
      description: `Multi-source data collection with comprehensive validation for ${useCase} processing`,
      type: 'action',
      connectors: ['Data Collection APIs', 'Validation Engine', 'Data Quality Tools', 'Integration Hub'],
      actions: ['Data Ingestion', 'Format Validation', 'Quality Assessment', 'Deduplication', 'Standardization'],
      requirements: ['Data Integration Platform', 'Validation Rules', 'Quality Standards', 'Error Handling'],
      stakeholders: ['Data Engineer', 'Data Analyst', 'Quality Assurance', 'System Admin', 'Business Users'],
      businessValue: 'Ensures data integrity and quality for downstream processes',
      riskLevel: 'high',
      automationLevel: 'fully-automated',
      estimatedDuration: 10,
      dependencies: ['Requirements Analysis & Stakeholder Identification']
    },
    {
      id: `ai-step-${baseId}-3`,
      title: 'Intelligent Classification & Routing',
      description: `AI-powered classification and intelligent routing based on ${useCase} context and business rules`,
      type: 'decision',
      connectors: ['ML Classification Engine', 'Routing Engine', 'Business Rules Engine', 'Decision API'],
      actions: ['Content Classification', 'Priority Assessment', 'Routing Decision', 'Queue Assignment', 'SLA Determination'],
      requirements: ['Machine Learning Models', 'Classification Training Data', 'Routing Rules', 'Priority Matrix'],
      stakeholders: ['AI/ML Engineer', 'Business Rules Analyst', 'Operations Manager', 'Domain Expert'],
      businessValue: 'Optimizes processing efficiency and resource allocation',
      riskLevel: 'medium',
      automationLevel: 'fully-automated',
      estimatedDuration: 6,
      dependencies: ['Data Collection & Input Validation']
    },
    {
      id: `ai-step-${baseId}-4`,
      title: 'Advanced Processing & Enrichment',
      description: `Sophisticated processing and data enrichment specifically designed for ${useCase} requirements`,
      type: 'action',
      connectors: ['Processing Engine', 'Enrichment APIs', 'External Data Sources', 'Analytics Platform'],
      actions: ['Core Processing', 'Data Enrichment', 'Context Building', 'Relationship Mapping', 'Insight Generation'],
      requirements: ['Processing Algorithms', 'Enrichment Database', 'External APIs', 'Analytics Tools'],
      stakeholders: ['Process Engineer', 'Data Scientist', 'Subject Matter Expert', 'Integration Specialist'],
      businessValue: 'Maximizes data value through intelligent processing and enrichment',
      riskLevel: 'medium',
      automationLevel: 'fully-automated',
      estimatedDuration: 12,
      dependencies: ['Intelligent Classification & Routing']
    },
    {
      id: `ai-step-${baseId}-5`,
      title: 'Quality Control & Validation Framework',
      description: `Multi-layered quality control and validation system for ${useCase} outputs`,
      type: 'validation',
      connectors: ['Quality Engine', 'Validation Framework', 'Testing Suite', 'Audit System'],
      actions: ['Quality Validation', 'Accuracy Assessment', 'Compliance Check', 'Error Detection', 'Performance Measurement'],
      requirements: ['Quality Standards', 'Validation Rules', 'Testing Framework', 'Audit Trail'],
      stakeholders: ['Quality Assurance Manager', 'Compliance Officer', 'Test Engineer', 'Business Validator'],
      businessValue: 'Ensures output quality and regulatory compliance',
      riskLevel: 'high',
      automationLevel: 'semi-automated',
      estimatedDuration: 8,
      dependencies: ['Advanced Processing & Enrichment']
    },
    {
      id: `ai-step-${baseId}-6`,
      title: 'Intelligent Decision Making & Recommendations',
      description: `AI-driven decision engine providing intelligent recommendations for ${useCase} scenarios`,
      type: 'decision',
      connectors: ['Decision Engine', 'Recommendation System', 'ML Models', 'Business Logic API'],
      actions: ['Decision Analysis', 'Recommendation Generation', 'Confidence Scoring', 'Alternative Options', 'Impact Assessment'],
      requirements: ['Decision Models', 'Historical Data', 'Business Rules', 'Confidence Thresholds'],
      stakeholders: ['Decision Analyst', 'Business Manager', 'AI Specialist', 'Risk Manager'],
      businessValue: 'Provides intelligent insights to optimize decision outcomes',
      riskLevel: 'medium',
      automationLevel: 'fully-automated',
      estimatedDuration: 9,
      dependencies: ['Quality Control & Validation Framework']
    },
    {
      id: `ai-step-${baseId}-7`,
      title: 'Multi-Channel Integration & Distribution',
      description: `Comprehensive integration and distribution system for ${useCase} across multiple channels and systems`,
      type: 'integration',
      connectors: ['Integration Hub', 'API Gateway', 'Message Queue', 'Distribution Engine'],
      actions: ['System Integration', 'Data Distribution', 'Channel Management', 'Sync Coordination', 'Status Tracking'],
      requirements: ['Integration Platform', 'API Management', 'Message Queuing', 'Channel Configurations'],
      stakeholders: ['Integration Architect', 'System Administrator', 'Channel Manager', 'Operations Team'],
      businessValue: 'Enables seamless data flow across all business systems',
      riskLevel: 'high',
      automationLevel: 'fully-automated',
      estimatedDuration: 10,
      dependencies: ['Intelligent Decision Making & Recommendations']
    },
    {
      id: `ai-step-${baseId}-8`,
      title: 'Stakeholder Communication & Notification System',
      description: `Intelligent communication system for ${useCase} stakeholder engagement and notifications`,
      type: 'integration',
      connectors: ['Communication Hub', 'Notification Engine', 'Template Manager', 'Delivery Tracking'],
      actions: ['Stakeholder Identification', 'Message Personalization', 'Multi-channel Delivery', 'Delivery Confirmation', 'Escalation Management'],
      requirements: ['Communication Platform', 'Template Library', 'Delivery Channels', 'Tracking System'],
      stakeholders: ['Communications Manager', 'Business Analyst', 'Customer Success', 'Operations Support'],
      businessValue: 'Ensures timely and effective stakeholder communication',
      riskLevel: 'low',
      automationLevel: 'fully-automated',
      estimatedDuration: 6,
      dependencies: ['Multi-Channel Integration & Distribution']
    },
    {
      id: `ai-step-${baseId}-9`,
      title: 'Exception Handling & Escalation Management',
      description: `Comprehensive exception handling and escalation management for ${useCase} edge cases`,
      type: 'decision',
      connectors: ['Exception Handler', 'Escalation Engine', 'Workflow Manager', 'Alert System'],
      actions: ['Exception Detection', 'Root Cause Analysis', 'Escalation Routing', 'Manual Override', 'Resolution Tracking'],
      requirements: ['Exception Rules', 'Escalation Matrix', 'Workflow Engine', 'Alert Configuration'],
      stakeholders: ['Operations Manager', 'Support Specialist', 'Process Owner', 'Management Team'],
      businessValue: 'Maintains service quality through effective exception management',
      riskLevel: 'high',
      automationLevel: 'semi-automated',
      estimatedDuration: 7,
      dependencies: ['Stakeholder Communication & Notification System']
    },
    {
      id: `ai-step-${baseId}-10`,
      title: 'Performance Monitoring & Analytics',
      description: `Real-time performance monitoring and analytics for ${useCase} optimization`,
      type: 'integration',
      connectors: ['Monitoring System', 'Analytics Engine', 'Dashboard API', 'Reporting Service'],
      actions: ['Performance Tracking', 'Metric Collection', 'Trend Analysis', 'Anomaly Detection', 'Report Generation'],
      requirements: ['Monitoring Tools', 'Analytics Platform', 'Dashboard Framework', 'Reporting Engine'],
      stakeholders: ['Performance Analyst', 'Operations Manager', 'Business Intelligence Team', 'Executive Dashboard Users'],
      businessValue: 'Provides insights for continuous improvement and optimization',
      riskLevel: 'low',
      automationLevel: 'fully-automated',
      estimatedDuration: 8,
      dependencies: ['Exception Handling & Escalation Management']
    },
    {
      id: `ai-step-${baseId}-11`,
      title: 'Compliance & Audit Trail Management',
      description: `Comprehensive compliance monitoring and audit trail management for ${useCase} governance`,
      type: 'validation',
      connectors: ['Compliance Engine', 'Audit System', 'Governance Framework', 'Documentation Manager'],
      actions: ['Compliance Monitoring', 'Audit Trail Generation', 'Policy Enforcement', 'Risk Assessment', 'Regulatory Reporting'],
      requirements: ['Compliance Framework', 'Audit Standards', 'Policy Repository', 'Risk Management Tools'],
      stakeholders: ['Compliance Officer', 'Audit Manager', 'Risk Manager', 'Legal Team', 'Regulatory Affairs'],
      businessValue: 'Ensures regulatory compliance and reduces legal risk',
      riskLevel: 'high',
      automationLevel: 'semi-automated',
      estimatedDuration: 9,
      dependencies: ['Performance Monitoring & Analytics']
    },
    {
      id: `ai-step-${baseId}-12`,
      title: 'Continuous Improvement & Optimization',
      description: `Machine learning-driven continuous improvement system for ${useCase} optimization`,
      type: 'integration',
      connectors: ['ML Analytics Engine', 'Optimization Service', 'Feedback Loop', 'A/B Testing Platform'],
      actions: ['Performance Analysis', 'Optimization Identification', 'A/B Testing', 'Model Refinement', 'Process Enhancement'],
      requirements: ['ML Platform', 'Optimization Algorithms', 'Testing Framework', 'Feedback Systems'],
      stakeholders: ['Data Scientist', 'Process Improvement Team', 'Business Analyst', 'Product Manager'],
      businessValue: 'Drives continuous value creation through intelligent optimization',
      riskLevel: 'medium',
      automationLevel: 'fully-automated',
      estimatedDuration: 10,
      dependencies: ['Compliance & Audit Trail Management']
    }
  ];

  return steps.map(step => {
    // Enhance with model-specific capabilities
    switch (modelType) {
      case 'llm':
        step.actions?.push('Natural Language Processing', 'Context Understanding');
        step.requirements?.push('Language Model API', 'Context Management');
        step.connectors?.push('LLM API', 'Context Engine');
        break;
      case 'vision':
        if (step.type === 'validation' || step.type === 'action') {
          step.actions?.push('Image Analysis', 'Visual Recognition');
          step.requirements?.push('Computer Vision API', 'Image Processing');
          step.connectors?.push('Vision API', 'OCR Service');
        }
        break;
      case 'mcp':
        step.actions?.push('Multi-Modal Processing', 'Context Persistence');
        step.requirements?.push('MCP Server', 'Context Database');
        step.connectors?.push('MCP Protocol', 'Context Store');
        break;
    }
    return step;
  });
};