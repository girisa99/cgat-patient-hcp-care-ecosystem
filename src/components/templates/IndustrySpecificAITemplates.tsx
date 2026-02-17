/**
 * Industry-Specific AI Templates
 * Comprehensive templates for different industries with node integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Heart, 
  GraduationCap, 
  ShoppingCart, 
  Banknote, 
  Factory,
  Search,
  Filter,
  Download,
  Star,
  Eye,
  Plus,
  Zap,
  Brain,
  Globe,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Wrench,
  FileText,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { supabase } from '@/integrations/supabase/client';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  nodeTypes: string[];
  workflow: {
    nodes: any[];
    edges: any[];
    settings: Record<string, any>;
  };
  aiPrompts: AIPromptTemplate[];
  configuration: TemplateConfiguration;
  metrics: TemplateMetrics;
  isPopular: boolean;
  isFeatured: boolean;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
}

interface AIPromptTemplate {
  id: string;
  name: string;
  purpose: string;
  prompt: string;
  variables: PromptVariable[];
  model: string;
  parameters: Record<string, any>;
  examples: PromptExample[];
}

interface PromptVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

interface PromptExample {
  input: Record<string, any>;
  output: string;
  explanation: string;
}

interface TemplateConfiguration {
  requiredIntegrations: string[];
  optionalIntegrations: string[];
  permissions: string[];
  dataRequirements: string[];
  scalingOptions: Record<string, any>;
}

interface TemplateMetrics {
  downloads: number;
  rating: number;
  reviews: number;
  successRate: number;
  averageSetupTime: number;
}

const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'healthcare-patient-triage',
    name: 'Patient Triage & Routing',
    industry: 'Healthcare',
    category: 'Patient Management',
    description: 'AI-powered patient triage system that automatically assesses symptoms and routes patients to appropriate care providers',
    useCase: 'Emergency departments, urgent care centers, telemedicine platforms',
    difficulty: 'intermediate',
    estimatedTime: '45-60 minutes',
    tags: ['Healthcare', 'Triage', 'AI Assessment', 'Patient Routing', 'Emergency Care'],
    nodeTypes: ['ai_decision', 'data_processor', 'notification', 'database_lookup', 'conditional_router'],
    workflow: {
      nodes: [
        { id: 'intake', type: 'data_processor', label: 'Patient Intake', position: { x: 100, y: 100 } },
        { id: 'symptoms', type: 'ai_decision', label: 'Symptom Analysis', position: { x: 300, y: 100 } },
        { id: 'triage', type: 'ai_decision', label: 'Triage Decision', position: { x: 500, y: 100 } },
        { id: 'routing', type: 'conditional_router', label: 'Care Routing', position: { x: 700, y: 100 } }
      ],
      edges: [
        { id: 'e1', source: 'intake', target: 'symptoms' },
        { id: 'e2', source: 'symptoms', target: 'triage' },
        { id: 'e3', source: 'triage', target: 'routing' }
      ],
      settings: {
        priority: 'high',
        timeout: 300,
        retryAttempts: 3
      }
    },
    aiPrompts: [
      {
        id: 'symptom-analysis',
        name: 'Symptom Analysis',
        purpose: 'Analyze patient symptoms and provide initial assessment',
        prompt: `You are a medical AI assistant. Analyze the following patient symptoms and provide a structured assessment:

Patient Information:
- Age: {{age}}
- Gender: {{gender}}
- Chief Complaint: {{chief_complaint}}
- Symptoms: {{symptoms}}
- Duration: {{duration}}
- Severity (1-10): {{severity}}
- Medical History: {{medical_history}}

Provide assessment in this format:
1. Primary Concern: [Brief description]
2. Urgency Level: [High/Medium/Low]
3. Recommended Action: [Immediate care/Urgent care/Schedule appointment]
4. Additional Information Needed: [List any missing information]
5. Red Flags: [Any concerning symptoms that require immediate attention]

Be thorough but concise. Always err on the side of caution for patient safety.`,
        variables: [
          { name: 'age', type: 'number', description: 'Patient age', required: true },
          { name: 'gender', type: 'select', description: 'Patient gender', required: true, options: ['Male', 'Female', 'Other'] },
          { name: 'chief_complaint', type: 'text', description: 'Main reason for visit', required: true },
          { name: 'symptoms', type: 'text', description: 'Detailed symptoms', required: true },
          { name: 'duration', type: 'text', description: 'How long symptoms have persisted', required: true },
          { name: 'severity', type: 'number', description: 'Pain/severity level 1-10', required: true },
          { name: 'medical_history', type: 'text', description: 'Relevant medical history', required: false }
        ],
        model: 'gpt-4o',
        parameters: {
          temperature: 0.3,
          max_tokens: 1000
        },
        examples: [
          {
            input: {
              age: 35,
              gender: 'Female',
              chief_complaint: 'Chest pain',
              symptoms: 'Sharp chest pain, shortness of breath, dizziness',
              duration: '2 hours',
              severity: 8,
              medical_history: 'Family history of heart disease'
            },
            output: 'Primary Concern: Acute chest pain with cardiac risk factors\nUrgency Level: High\nRecommended Action: Immediate emergency care\nAdditional Information Needed: Vital signs, ECG\nRed Flags: Combination of chest pain, shortness of breath, and family cardiac history requires immediate evaluation',
            explanation: 'High-risk presentation requiring immediate medical attention'
          }
        ]
      }
    ],
    configuration: {
      requiredIntegrations: ['EMR System', 'Notification Service'],
      optionalIntegrations: ['Telehealth Platform', 'Lab System'],
      permissions: ['patient_data_read', 'care_provider_notify'],
      dataRequirements: ['Patient demographics', 'Symptom data', 'Medical history'],
      scalingOptions: {
        concurrentPatients: 100,
        avgProcessingTime: '2-3 minutes',
        peakCapacity: '500 patients/hour'
      }
    },
    metrics: {
      downloads: 2450,
      rating: 4.8,
      reviews: 156,
      successRate: 94.2,
      averageSetupTime: 52
    },
    isPopular: true,
    isFeatured: true,
    createdBy: 'Healthcare AI Team',
    createdAt: '2024-01-05T00:00:00Z',
    lastUpdated: '2024-01-08T00:00:00Z'
  },
  {
    id: 'ecommerce-personalization',
    name: 'E-commerce Personalization Engine',
    industry: 'E-commerce',
    category: 'Customer Experience',
    description: 'AI-driven personalization system that customizes product recommendations, pricing, and content based on customer behavior',
    useCase: 'Online retailers, marketplaces, subscription services',
    difficulty: 'advanced',
    estimatedTime: '90-120 minutes',
    tags: ['E-commerce', 'Personalization', 'Recommendations', 'Customer Analytics', 'Revenue Optimization'],
    nodeTypes: ['ai_recommendation', 'data_processor', 'api_connector', 'conditional_router', 'analytics'],
    workflow: {
      nodes: [
        { id: 'customer_data', type: 'data_processor', label: 'Customer Data Aggregation', position: { x: 100, y: 100 } },
        { id: 'behavior_analysis', type: 'ai_recommendation', label: 'Behavior Analysis', position: { x: 300, y: 100 } },
        { id: 'product_matching', type: 'ai_recommendation', label: 'Product Matching', position: { x: 500, y: 100 } },
        { id: 'content_personalization', type: 'conditional_router', label: 'Content Personalization', position: { x: 700, y: 100 } }
      ],
      edges: [
        { id: 'e1', source: 'customer_data', target: 'behavior_analysis' },
        { id: 'e2', source: 'behavior_analysis', target: 'product_matching' },
        { id: 'e3', source: 'product_matching', target: 'content_personalization' }
      ],
      settings: {
        realTimeProcessing: true,
        cacheResults: true,
        abTestingEnabled: true
      }
    },
    aiPrompts: [
      {
        id: 'product-recommendations',
        name: 'Product Recommendations',
        purpose: 'Generate personalized product recommendations',
        prompt: `Generate personalized product recommendations for this customer:

Customer Profile:
- Customer ID: {{customer_id}}
- Age Group: {{age_group}}
- Location: {{location}}
- Purchase History: {{purchase_history}}
- Browsing Behavior: {{browsing_behavior}}
- Preferences: {{preferences}}
- Budget Range: {{budget_range}}

Available Products:
{{product_catalog}}

Current Context:
- Season: {{season}}
- Current Page: {{current_page}}
- Cart Items: {{cart_items}}
- Special Promotions: {{promotions}}

Provide recommendations in this format:
1. Primary Recommendations (5 products):
   - Product Name | Price | Reason | Confidence Score (1-10)

2. Alternative Recommendations (3 products):
   - Product Name | Price | Reason | Confidence Score (1-10)

3. Cross-sell Opportunities:
   - Complementary products based on cart items

4. Personalization Strategy:
   - Explain why these recommendations fit this customer

Focus on relevance, purchase likelihood, and revenue optimization.`,
        variables: [
          { name: 'customer_id', type: 'text', description: 'Unique customer identifier', required: true },
          { name: 'age_group', type: 'select', description: 'Customer age group', required: true, options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
          { name: 'location', type: 'text', description: 'Customer location', required: false },
          { name: 'purchase_history', type: 'text', description: 'Previous purchases', required: true },
          { name: 'browsing_behavior', type: 'text', description: 'Recent browsing patterns', required: true },
          { name: 'preferences', type: 'text', description: 'Known preferences', required: false },
          { name: 'budget_range', type: 'select', description: 'Typical spending range', required: false, options: ['<$50', '$50-$100', '$100-$250', '$250+'] }
        ],
        model: 'gpt-4o',
        parameters: {
          temperature: 0.4,
          max_tokens: 1500
        },
        examples: []
      }
    ],
    configuration: {
      requiredIntegrations: ['Product Catalog API', 'Customer Database', 'Analytics Platform'],
      optionalIntegrations: ['Email Marketing', 'Push Notifications', 'A/B Testing Platform'],
      permissions: ['customer_data_read', 'product_data_read', 'recommendation_write'],
      dataRequirements: ['Customer profiles', 'Product catalog', 'Transaction history', 'Behavioral data'],
      scalingOptions: {
        concurrentUsers: 10000,
        avgResponseTime: '50ms',
        recommendationsPerSecond: 1000
      }
    },
    metrics: {
      downloads: 1890,
      rating: 4.6,
      reviews: 98,
      successRate: 87.5,
      averageSetupTime: 105
    },
    isPopular: true,
    isFeatured: false,
    createdBy: 'E-commerce AI Solutions',
    createdAt: '2024-01-03T00:00:00Z',
    lastUpdated: '2024-01-07T00:00:00Z'
  },
  {
    id: 'finance-fraud-detection',
    name: 'Real-time Fraud Detection',
    industry: 'Finance',
    category: 'Risk Management',
    description: 'Advanced AI system for detecting fraudulent transactions in real-time with adaptive learning capabilities',
    useCase: 'Banks, fintech companies, payment processors, credit card companies',
    difficulty: 'advanced',
    estimatedTime: '120-180 minutes',
    tags: ['Finance', 'Fraud Detection', 'Risk Assessment', 'Machine Learning', 'Real-time Processing'],
    nodeTypes: ['ai_classifier', 'data_processor', 'risk_scorer', 'alert_system', 'feedback_loop'],
    workflow: {
      nodes: [
        { id: 'transaction_intake', type: 'data_processor', label: 'Transaction Processing', position: { x: 100, y: 100 } },
        { id: 'risk_analysis', type: 'ai_classifier', label: 'Risk Analysis', position: { x: 300, y: 100 } },
        { id: 'fraud_scoring', type: 'risk_scorer', label: 'Fraud Scoring', position: { x: 500, y: 100 } },
        { id: 'decision_engine', type: 'conditional_router', label: 'Decision Engine', position: { x: 700, y: 100 } }
      ],
      edges: [
        { id: 'e1', source: 'transaction_intake', target: 'risk_analysis' },
        { id: 'e2', source: 'risk_analysis', target: 'fraud_scoring' },
        { id: 'e3', source: 'fraud_scoring', target: 'decision_engine' }
      ],
      settings: {
        realTimeProcessing: true,
        lowLatencyMode: true,
        adaptiveLearning: true
      }
    },
    aiPrompts: [
      {
        id: 'fraud-risk-assessment',
        name: 'Fraud Risk Assessment',
        purpose: 'Assess transaction fraud risk based on multiple factors',
        prompt: `Analyze this financial transaction for fraud risk:

Transaction Details:
- Amount: $\{{amount}}
- Merchant: {{merchant}}
- Location: {{location}}
- Time: {{timestamp}}
- Payment Method: {{payment_method}}
- Card Type: {{card_type}}

Customer Profile:
- Customer ID: {{customer_id}}
- Account Age: {{account_age}}
- Typical Transaction Pattern: {{typical_pattern}}
- Recent Activity: {{recent_activity}}
- Geographic Pattern: {{geographic_pattern}}
- Spending Pattern: {{spending_pattern}}

Risk Indicators:
- IP Address: {{ip_address}}
- Device Information: {{device_info}}
- Velocity Checks: {{velocity_checks}}
- Blacklist Status: {{blacklist_status}}

Provide risk assessment in this format:
1. Overall Risk Score (0-100): [Score]
2. Risk Level: [Low/Medium/High/Critical]
3. Primary Risk Factors:
   - Factor 1: [Description] | Weight: [1-10]
   - Factor 2: [Description] | Weight: [1-10]
   - Factor 3: [Description] | Weight: [1-10]

4. Recommended Action:
   - [Approve/Review/Decline/Additional Verification]

5. Reasoning:
   - [Detailed explanation of the decision]

6. Monitoring Recommendations:
   - [What to watch for in future transactions]

Be precise and focus on actionable insights for fraud prevention.`,
        variables: [
          { name: 'amount', type: 'number', description: 'Transaction amount', required: true, defaultValue: 0 },
          { name: 'merchant', type: 'text', description: 'Merchant name/category', required: true },
          { name: 'location', type: 'text', description: 'Transaction location', required: true },
          { name: 'timestamp', type: 'text', description: 'Transaction timestamp', required: true },
          { name: 'payment_method', type: 'select', description: 'Payment method used', required: true, options: ['Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer'] },
          { name: 'customer_id', type: 'text', description: 'Customer identifier', required: true }
        ],
        model: 'gpt-4o',
        parameters: {
          temperature: 0.1,
          max_tokens: 1200
        },
        examples: []
      }
    ],
    configuration: {
      requiredIntegrations: ['Payment Processor', 'Customer Database', 'Risk Management System'],
      optionalIntegrations: ['Law Enforcement API', 'Credit Bureau', 'Geolocation Service'],
      permissions: ['transaction_data_read', 'fraud_alert_write', 'customer_notify'],
      dataRequirements: ['Transaction data', 'Customer profiles', 'Historical fraud data', 'Device fingerprints'],
      scalingOptions: {
        transactionsPerSecond: 5000,
        avgProcessingTime: '10ms',
        falsePositiveRate: '<2%'
      }
    },
    metrics: {
      downloads: 3200,
      rating: 4.9,
      reviews: 245,
      successRate: 96.8,
      averageSetupTime: 155
    },
    isPopular: true,
    isFeatured: true,
    createdBy: 'FinTech Security Labs',
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-08T00:00:00Z'
  }
];

export const IndustrySpecificAITemplates: React.FC = () => {
  const { toast } = useToast();
  const { nodeTypes, categories } = useWorkflowNodes();
  
  const [templates, setTemplates] = useState<IndustryTemplate[]>(INDUSTRY_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);

  const industries = Array.from(new Set(templates.map(t => t.industry)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return matchesSearch && matchesIndustry && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.metrics.downloads - a.metrics.downloads;
      case 'rating':
        return b.metrics.rating - a.metrics.rating;
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const handleUseTemplate = async (template: IndustryTemplate) => {
    try {
      // Create workflow template in database with node type integration
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: template.name,
          description: template.description,
          category: template.industry,
          template_data: template.workflow,
          ai_prompts: template.aiPrompts,
          configuration: template.configuration,
          is_active: true,
          created_by: 'current_user'
        });

      if (error) throw error;

      toast({
        title: "Template Applied",
        description: `${template.name} has been added to your workspace`,
      });

      // Update download count
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, metrics: { ...t.metrics, downloads: t.metrics.downloads + 1 } }
          : t
      ));

    } catch (error) {
      toast({
        title: "Failed to Apply Template",
        description: "There was an error applying the template",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'Healthcare':
        return <Heart className="w-4 h-4" />;
      case 'E-commerce':
        return <ShoppingCart className="w-4 h-4" />;
      case 'Finance':
        return <Banknote className="w-4 h-4" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4" />;
      case 'Manufacturing':
        return <Factory className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const renderTemplateCard = (template: IndustryTemplate) => (
    <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIndustryIcon(template.industry)}
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground">{template.category}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {template.isFeatured && (
              <Badge variant="secondary" className="text-xs">Featured</Badge>
            )}
            {template.isPopular && (
              <Badge variant="outline" className="text-xs">Popular</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(template.difficulty)}>
            {template.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {template.estimatedTime}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{template.metrics.rating}</span>
            <span className="text-muted-foreground">({template.metrics.reviews})</span>
          </div>
          <span className="text-muted-foreground">{template.metrics.downloads.toLocaleString()} downloads</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            {template.aiPrompts.length} AI prompts
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTemplate(template)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => handleUseTemplate(template)}
            >
              <Download className="w-3 h-3 mr-1" />
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateDetail = (template: IndustryTemplate) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getIndustryIcon(template.industry)}
            {template.name}
          </CardTitle>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            Close
          </Button>
        </div>
        <p className="text-muted-foreground">{template.description}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{template.metrics.rating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{template.metrics.downloads}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{template.metrics.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{template.metrics.averageSetupTime}m</div>
                <div className="text-sm text-muted-foreground">Avg Setup</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Use Case</h4>
              <p className="text-sm text-muted-foreground">{template.useCase}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="workflow" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Workflow Structure</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1">Nodes ({template.workflow.nodes.length})</h5>
                  <div className="space-y-1">
                    {template.workflow.nodes.map((node, index) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {node.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Connections ({template.workflow.edges.length})</h5>
                  <div className="space-y-1">
                    {template.workflow.edges.map((edge, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {edge.source} → {edge.target}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="prompts" className="space-y-4">
            {template.aiPrompts.map((prompt, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{prompt.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{prompt.purpose}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h6 className="text-xs font-medium">Model: {prompt.model}</h6>
                    </div>
                    <div>
                      <h6 className="text-xs font-medium mb-1">Variables ({prompt.variables.length})</h6>
                      <div className="flex flex-wrap gap-1">
                        {prompt.variables.map((variable, vIndex) => (
                          <Badge key={vIndex} variant="outline" className="text-xs">
                            {variable.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Required Integrations</h4>
                <div className="space-y-1">
                  {template.configuration.requiredIntegrations.map((integration, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {integration}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Integrations</h4>
                <div className="space-y-1">
                  {template.configuration.optionalIntegrations.map((integration, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <Plus className="w-3 h-3 text-gray-400" />
                      {integration}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Scaling Options</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {Object.entries(template.configuration.scalingOptions).map(([key, value]) => (
                  <div key={key}>
                    <div className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                    <div className="text-muted-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Save to Favorites
          </Button>
          <Button onClick={() => handleUseTemplate(template)}>
            <Download className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Industry-Specific AI Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pre-built AI workflows designed for specific industries with integrated node configurations
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {selectedTemplate ? (
            renderTemplateDetail(selectedTemplate)
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(renderTemplateCard)}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No templates found matching your criteria</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};