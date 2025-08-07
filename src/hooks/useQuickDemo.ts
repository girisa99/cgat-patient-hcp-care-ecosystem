/**
 * Quick Demo Mode Hook - AI Learning & Experimentation Focus
 * No database roles required - detects demo mode through multiple methods
 */

import { useState, useEffect, useCallback } from 'react';
import { demoDataService } from '@/services/demoDataService';
import { useToast } from './use-toast';

interface QuickDemoConfig {
  isEnabled: boolean;
  mode: 'ai_learning' | 'full_exploration' | 'guided_tour';
  aiExperimentationLevel: 'beginner' | 'intermediate' | 'advanced';
  allowedInteractions: string[];
  restrictedActions: string[];
}

export const useQuickDemo = () => {
  const { toast } = useToast();
  const [demoConfig, setDemoConfig] = useState<QuickDemoConfig>({
    isEnabled: false,
    mode: 'ai_learning',
    aiExperimentationLevel: 'beginner',
    allowedInteractions: [],
    restrictedActions: []
  });
  const [mockData, setMockData] = useState<any>(null);
  const [isLoadingMockData, setIsLoadingMockData] = useState(false);
  const [aiLearningPath, setAiLearningPath] = useState<string[]>([]);

  // Multiple demo detection methods
  const detectDemoMode = useCallback(() => {
    // Method 1: URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('demo') || urlParams.has('ai-demo') || urlParams.has('learn')) {
      return true;
    }

    // Method 2: LocalStorage flag
    if (localStorage.getItem('healthcare-ai-demo-mode') === 'true') {
      return true;
    }

    // Method 3: Subdomain detection
    if (window.location.hostname.includes('demo') || window.location.hostname.includes('learn')) {
      return true;
    }

    // Method 4: Special demo session
    if (sessionStorage.getItem('ai-experimentation-session')) {
      return true;
    }

    return false;
  }, []);

  // Initialize demo mode
  useEffect(() => {
    const isDemoDetected = detectDemoMode();
    
    if (isDemoDetected) {
      const urlParams = new URLSearchParams(window.location.search);
      const level = urlParams.get('level') as 'beginner' | 'intermediate' | 'advanced' || 'beginner';
      const mode = urlParams.get('mode') as 'ai_learning' | 'full_exploration' | 'guided_tour' || 'ai_learning';
      
      setDemoConfig({
        isEnabled: true,
        mode,
        aiExperimentationLevel: level,
        allowedInteractions: [
          'view_agents',
          'test_ai_models',
          'explore_apis', 
          'run_simulations',
          'view_analytics',
          'learn_workflows'
        ],
        restrictedActions: [
          'create_real_data',
          'delete_anything',
          'modify_settings',
          'export_data',
          'invite_users'
        ]
      });

      loadAiDemoData();
      setupLearningPath(level);
    }
  }, [detectDemoMode]);

  // Load AI-focused demo data
  const loadAiDemoData = useCallback(async () => {
    setIsLoadingMockData(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = demoDataService.generateAllMockData();
      
      // Enhance with AI-specific content
      const aiEnhancedData = {
        ...data,
        aiModels: [
          {
            id: '1',
            name: 'Claude-4 Sonnet',
            type: 'Healthcare Reasoning',
            capabilities: ['Clinical Analysis', 'Treatment Planning', 'Documentation'],
            accuracy: 94.5,
            responseTime: 230,
            status: 'active',
            costPerRequest: 0.003,
            description: 'Advanced reasoning for complex healthcare scenarios'
          },
          {
            id: '2', 
            name: 'GPT-4o Healthcare',
            type: 'Multi-modal Analysis',
            capabilities: ['Medical Imaging', 'Lab Results', 'Patient Interaction'],
            accuracy: 91.2,
            responseTime: 180,
            status: 'active',
            costPerRequest: 0.004,
            description: 'Visual and text analysis for comprehensive care'
          },
          {
            id: '3',
            name: 'Gemini Pro Med',
            type: 'Predictive Analytics',
            capabilities: ['Risk Assessment', 'Outcome Prediction', 'Resource Planning'],
            accuracy: 89.8,
            responseTime: 150,
            status: 'active', 
            costPerRequest: 0.002,
            description: 'Predictive modeling for proactive healthcare'
          }
        ],
        aiWorkflows: [
          {
            id: '1',
            name: 'Patient Triage Assistant',
            steps: ['Symptom Analysis', 'Severity Assessment', 'Priority Assignment', 'Provider Routing'],
            aiModels: ['Claude-4 Sonnet'],
            avgProcessingTime: '45 seconds',
            accuracyRate: '96%',
            patientsProcessed: 1247
          },
          {
            id: '2',
            name: 'Treatment Recommendation Engine',
            steps: ['Medical History Review', 'Current Symptoms Analysis', 'Evidence-Based Lookup', 'Recommendation Generation'],
            aiModels: ['GPT-4o Healthcare', 'Gemini Pro Med'],
            avgProcessingTime: '1.2 minutes',
            accuracyRate: '93%',
            recommendationsGenerated: 892
          },
          {
            id: '3',
            name: 'Clinical Documentation AI',
            steps: ['Voice-to-Text', 'Medical Terminology Processing', 'Structure Generation', 'Compliance Check'],
            aiModels: ['Claude-4 Sonnet'],
            avgProcessingTime: '30 seconds',
            accuracyRate: '98%',
            documentsProcessed: 2156
          }
        ],
        learningModules: [
          {
            id: '1',
            title: 'AI in Healthcare: Getting Started',
            description: 'Learn the fundamentals of AI implementation in healthcare settings',
            duration: '15 minutes',
            difficulty: 'beginner',
            topics: ['AI Basics', 'Healthcare Applications', 'Ethical Considerations']
          },
          {
            id: '2', 
            title: 'Building Your First Healthcare AI Agent',
            description: 'Step-by-step guide to creating an AI agent for patient care',
            duration: '30 minutes',
            difficulty: 'intermediate',
            topics: ['Agent Architecture', 'Training Data', 'Testing & Validation']
          },
          {
            id: '3',
            title: 'Advanced AI Model Integration',
            description: 'Integrate multiple AI models for comprehensive healthcare solutions',
            duration: '45 minutes', 
            difficulty: 'advanced',
            topics: ['Multi-Model Architecture', 'Performance Optimization', 'Scaling Considerations']
          }
        ]
      };
      
      setMockData(aiEnhancedData);
      
      toast({
        title: "🤖 AI Demo Mode Activated",
        description: "Explore AI capabilities with realistic healthcare scenarios",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Failed to load AI demo data:', error);
      toast({
        title: "Demo Mode Warning", 
        description: "Some AI features may not work correctly",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMockData(false);
    }
  }, [toast]);

  // Setup learning path based on user level
  const setupLearningPath = useCallback((level: string) => {
    const paths = {
      beginner: [
        'Explore AI Models',
        'View Healthcare Agents', 
        'Test Simple Workflows',
        'Review AI Analytics',
        'Learn Best Practices'
      ],
      intermediate: [
        'Configure AI Agents',
        'Test Multi-Model Workflows',
        'Analyze Performance Metrics',
        'Experiment with APIs',
        'Build Custom Integrations'
      ],
      advanced: [
        'Advanced Model Tuning',
        'Complex Workflow Design',
        'Performance Optimization',
        'Custom AI Development',
        'Enterprise Integration'
      ]
    };
    
    setAiLearningPath(paths[level as keyof typeof paths] || paths.beginner);
  }, []);

  // Enable demo mode manually (for buttons/links)
  const enableDemoMode = useCallback((level: 'beginner' | 'intermediate' | 'advanced' = 'beginner') => {
    localStorage.setItem('healthcare-ai-demo-mode', 'true');
    sessionStorage.setItem('ai-experimentation-session', Date.now().toString());
    
    setDemoConfig({
      isEnabled: true,
      mode: 'ai_learning',
      aiExperimentationLevel: level,
      allowedInteractions: [
        'view_agents',
        'test_ai_models', 
        'explore_apis',
        'run_simulations',
        'view_analytics',
        'learn_workflows'
      ],
      restrictedActions: [
        'create_real_data',
        'delete_anything',
        'modify_settings',
        'export_data',
        'invite_users'
      ]
    });
    
    loadAiDemoData();
    setupLearningPath(level);
  }, [loadAiDemoData, setupLearningPath]);

  // Disable demo mode
  const disableDemoMode = useCallback(() => {
    localStorage.removeItem('healthcare-ai-demo-mode');
    sessionStorage.removeItem('ai-experimentation-session');
    setDemoConfig(prev => ({ ...prev, isEnabled: false }));
    setMockData(null);
  }, []);

  // Check if action is allowed
  const isActionAllowed = useCallback((action: string) => {
    if (!demoConfig.isEnabled) return true;
    
    if (demoConfig.restrictedActions.includes(action)) {
      toast({
        title: "🎭 Demo Mode Restriction",
        description: `${action.replace('_', ' ')} is not available in AI learning mode`,
        variant: "default",
      });
      return false;
    }
    
    return true;
  }, [demoConfig, toast]);

  // Get AI-specific mock data
  const getAiData = useCallback((category: string) => {
    if (!mockData || !demoConfig.isEnabled) return [];
    
    // Map categories to our AI-enhanced data
    switch (category) {
      case 'aiModels':
        return mockData.aiModels || [];
      case 'aiWorkflows': 
        return mockData.aiWorkflows || [];
      case 'learningModules':
        return mockData.learningModules || [];
      case 'agents':
        return mockData.agents?.map((agent: any) => ({
          ...agent,
          aiCapabilities: ['Natural Language Processing', 'Clinical Analysis', 'Predictive Modeling'],
          learningMode: true
        })) || [];
      default:
        return mockData[category] || [];
    }
  }, [mockData, demoConfig.isEnabled]);

  // Simulate AI interaction
  const simulateAiInteraction = useCallback(async (type: string, input?: any) => {
    if (!demoConfig.isEnabled) return null;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      'clinical_analysis': {
        confidence: 94.2,
        recommendation: 'Based on symptoms, suggest routine monitoring with follow-up in 2 weeks',
        reasoning: 'Pattern matches common seasonal allergies, low risk factors present',
        nextSteps: ['Schedule follow-up', 'Prescribe antihistamine', 'Patient education']
      },
      'risk_assessment': {
        riskScore: 23,
        riskLevel: 'Low-Medium',
        factors: ['Age', 'Medical History', 'Current Symptoms'],
        recommendations: ['Continue current treatment', 'Monitor vitals', 'Lifestyle modifications']
      },
      'treatment_planning': {
        primaryTreatment: 'Conservative management',
        alternatives: ['Medication therapy', 'Lifestyle intervention'],
        timeline: '2-4 weeks',
        successProbability: '87%'
      }
    };
    
    return responses[type as keyof typeof responses] || { message: 'AI analysis complete', confidence: 85.5 };
  }, [demoConfig.isEnabled]);

  return {
    // Core state
    isDemoMode: demoConfig.isEnabled,
    demoConfig,
    mockData,
    isLoadingMockData,
    aiLearningPath,
    
    // Actions
    enableDemoMode,
    disableDemoMode,
    isActionAllowed,
    getAiData,
    simulateAiInteraction,
    
    // Learning features
    currentLevel: demoConfig.aiExperimentationLevel,
    learningProgress: aiLearningPath.length > 0 ? Math.floor(Math.random() * 60 + 20) : 0,
    
    // Meta
    meta: {
      hookName: 'useQuickDemo',
      version: '1.0.0',
      focus: 'AI Learning & Experimentation',
      detectionMethod: detectDemoMode() ? 'URL/LocalStorage/Subdomain' : 'none',
      totalMockRecords: mockData?.metadata?.total_records || 0
    }
  };
};