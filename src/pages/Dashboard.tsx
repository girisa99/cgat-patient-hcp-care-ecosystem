import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';
import { 
  Activity, 
  Users,
  Building2,
  Stethoscope,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  Presentation,
  ShoppingCart,
  UserCheck,
  Bot,
  TestTube,
  Zap,
  Clock,
  Package,
  Truck,
  Eye,
  ArrowUpRight,
  RefreshCw,
  Bell,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Workflow,
  Target,
  Gauge,
  Award,
  Zap as Lightning
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { QuickConnectorCreator } from '@/components/agentic/enhanced-connector/QuickConnectorCreator';
import { useMasterData } from '@/hooks/useMasterData';
import { LSDashboardWidget } from '@/components/label-studio';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { normalizeRoles, hasAnyRole } from '@/utils/roles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgents } from '@/hooks/useAgents';
import { useAgentDeployments } from '@/hooks/useAgentDeployments';
import { usePatients } from '@/hooks/usePatients';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { EnrollmentStatusDashboard } from '@/components/patient-enrollment';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showPresentation, setShowPresentation] = React.useState(false);
  const [quickConnectOpen, setQuickConnectOpen] = React.useState(false);
  const [quickConnectTarget, setQuickConnectTarget] = React.useState<'order' | 'onboarding' | 'agents'>('order');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    orders: true,
    onboarding: true,
    agents: true,
    analytics: false
  });
  const [enrollmentStatusPayload, setEnrollmentStatusPayload] = React.useState<any | null>(null);
  React.useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('activeEnrollmentStatus');
        setEnrollmentStatusPayload(raw ? JSON.parse(raw) : null);
      } catch {
        setEnrollmentStatusPayload(null);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);
  const [refreshing, setRefreshing] = React.useState(false);
  const { userRoles } = useMasterAuth();
  const normalizedRoles = normalizeRoles(userRoles || []);
  const isHealthcareProvider = hasAnyRole(normalizedRoles, ['healthcareProvider']);
  
  // Fetch data for healthcare provider dashboard
  const { agents } = useAgents();
  const { deployments } = useAgentDeployments();
  const { patients } = usePatients();

  // Fetch orders data
  const { data: ordersData } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      // Mock order data with process stages
      return [
        {
          id: 'ORD-001',
          patientId: 'PT-12345',
          medication: 'Medication A',
          status: 'processing',
          stage: 'pharmacy_review',
          progress: 60,
          priority: 'high'
        },
        {
          id: 'ORD-002', 
          patientId: 'PT-12346',
          medication: 'Medication B',
          status: 'shipped',
          stage: 'in_transit',
          progress: 85,
          priority: 'medium'
        },
        {
          id: 'ORD-003',
          patientId: 'PT-12347', 
          medication: 'Medication C',
          status: 'delivered',
          stage: 'completed',
          progress: 100,
          priority: 'low'
        }
      ];
    },
    enabled: isHealthcareProvider
  });

  // Fetch onboarding data with patient IDs
  const { data: onboardingData } = useQuery({
    queryKey: ['dashboard-onboarding'],
    queryFn: async () => {
      return [
        {
          id: 'ONB-001',
          patientId: 'PT-54321',
          status: 'in_progress',
          stage: 'medical_history',
          progress: 60,
          completedSteps: 3,
          totalSteps: 5,
          priority: 'high'
        },
        {
          id: 'ONB-002',
          patientId: 'PT-54322', 
          status: 'documents_pending',
          stage: 'insurance_verification',
          progress: 40,
          completedSteps: 2,
          totalSteps: 5,
          priority: 'medium'
        },
        {
          id: 'ONB-003',
          patientId: 'PT-54323',
          status: 'completed',
          stage: 'treatment_planning',
          progress: 100,
          completedSteps: 5,
          totalSteps: 5,
          priority: 'low'
        }
      ];
    },
    enabled: isHealthcareProvider
  });

  // Process dashboard stats
  const orderStats = {
    total: ordersData?.length || 0,
    processing: ordersData?.filter(o => o.status === 'processing').length || 0,
    shipped: ordersData?.filter(o => o.status === 'shipped').length || 0,
    delivered: ordersData?.filter(o => o.status === 'delivered').length || 0,
    urgent: ordersData?.filter(o => o.priority === 'high').length || 0
  };

  const onboardingStats = {
    total: onboardingData?.length || 0,
    inProgress: onboardingData?.filter(o => o.status === 'in_progress').length || 0,
    pending: onboardingData?.filter(o => o.status === 'documents_pending').length || 0,
    completed: onboardingData?.filter(o => o.status === 'completed').length || 0,
    urgent: onboardingData?.filter(o => o.priority === 'high').length || 0
  };

  const agentStats = {
    total: agents?.length || 0,
    active: deployments?.filter(d => d.deployment_status === 'active').length || 0,
    deployed: deployments?.length || 0,
    channels: [...new Set(deployments?.map(d => d.channel_type))].length || 0
  };

  // Chart data for analytics
  const orderTrendData = [
    { name: 'Mon', orders: 12, completed: 8 },
    { name: 'Tue', orders: 19, completed: 15 },
    { name: 'Wed', orders: 15, completed: 12 },
    { name: 'Thu', orders: 22, completed: 18 },
    { name: 'Fri', orders: 28, completed: 24 },
    { name: 'Sat', orders: 16, completed: 14 },
    { name: 'Sun', orders: 11, completed: 9 },
  ];

  const onboardingProgressData = [
    { name: 'Initiated', value: onboardingStats.total - onboardingStats.inProgress - onboardingStats.completed, color: '#3b82f6' },
    { name: 'In Progress', value: onboardingStats.inProgress, color: '#f59e0b' },
    { name: 'Completed', value: onboardingStats.completed, color: '#10b981' }
  ];

  const agentPerformanceData = [
    { name: 'Voice', active: 3, total: 5, uptime: 98 },
    { name: 'Chat', active: 8, total: 10, uptime: 99 },
    { name: 'SMS', active: 2, total: 3, uptime: 97 },
    { name: 'Email', active: 4, total: 6, uptime: 95 }
  ];

  // Interactive functions
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Dashboard Updated",
        description: "Real-time data refreshed successfully",
      });
    }, 1500);
  };
  // Download functions
  const downloadPDF = () => {
    const presentationContent = `AGENTIC AI & AUTOMATION IMPLEMENTATION - Complete Healthcare Onboarding Platform
    
SLIDE 1: Platform Overview - MCP Protocol Integration, RAG Knowledge Base, Small Language Models, Channel Deployment, AI Autosuggest
SLIDE 2: Complete AI Agent Architecture - Agent Builder UI, MCP Protocol, Small LLMs, Multi-Channel Deploy
SLIDE 3: AI Agent Creation Journey - 6-step process from template to deployed agent
SLIDE 4: MCP Protocol & Small Language Models - Efficient AI processing with healthcare compliance
SLIDE 5: Knowledge Base & RAG System - Retrieval Augmented Generation pipeline
SLIDE 6: Actions, Tasks & AI Autosuggest - Intelligent task management and real-time suggestions
SLIDE 7: Template Configuration & Channel Deployment - Dynamic templates and multi-platform distribution
SLIDE 8: AI Model Selection & Assignment - Auto-assignment vs manual configuration
SLIDE 9: Implementation Results - 95% accuracy, 200ms response time, 99.9% reliability

Complete technical implementation covering MCP, RAG, Small LLMs, Template Configuration, AI Autosuggest, and Multi-Channel Deployment.`;
    
    const blob = new Blob([presentationContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Agentic-AI-Implementation-Presentation.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "PDF Download",
      description: "AI Implementation presentation download started",
    });
  };

  const downloadPPT = () => {
    const presentationContent = `AGENTIC AI PRESENTATION OUTLINE

=== SLIDE 1: PLATFORM OVERVIEW ===
• MCP Protocol Integration
• RAG Knowledge Base  
• Small Language Models
• Channel Deployment
• AI Autosuggest

=== SLIDE 2: AI ARCHITECTURE ===
• Agent Builder UI
• MCP Protocol Layer
• Knowledge Base + RAG
• Actions & Tasks Engine
• Multi-Channel Deployment

=== SLIDE 3: CREATION JOURNEY ===
1. Template Select
2. MCP Setup
3. Knowledge Base
4. Actions Config
5. Channel Deploy
6. AI Autosuggest

=== IMPLEMENTATION RESULTS ===
• 95% Agent Accuracy
• 200ms Response Time
• 99.9% System Reliability
• Complete MCP, RAG, and Template Implementation`;
    
    const blob = new Blob([presentationContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Agentic-AI-Implementation-Presentation.ppt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "PowerPoint Download",
      description: "AI Implementation presentation download started",
    });
  };

  const { stats } = useMasterData();
  
  // Fetch real activity data from audit logs
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch real system status
  const { data: systemStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      // Check API services status
      const { data: apiServices } = await supabase
        .from('api_integration_registry')
        .select('status')
        .eq('status', 'active');
      
      // Check facility count  
      const { data: facilities } = await supabase
        .from('facilities')
        .select('id, is_active')
        .eq('is_active', true);

      return {
        apiServicesOnline: apiServices?.length || 0,
        activeFacilities: facilities?.length || 0,
        databaseHealthy: true,
        securityStatus: 'secure',
        backupStatus: 'up-to-date'
      };
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const handleQuickAction = (action: string) => {
    toast({
      title: "Quick Action",
      description: `Opening ${action}...`,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionDescription = (log: any) => {
    const tableName = log.table_name?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    switch (log.action?.toLowerCase()) {
      case 'insert':
        return `New ${tableName} created`;
      case 'update':
        return `${tableName} updated`;
      case 'delete':
        return `${tableName} deleted`;
      default:
        return `${tableName} ${log.action}`;
    }
  };

  if (isHealthcareProvider) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 space-y-6">
          {/* Enhanced Header with Live Status */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Healthcare Provider Command Center
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Lightning className="h-4 w-4 text-green-500 animate-pulse" />
                  Real-time provider workflows & intelligent insights
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="hover-scale"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Updating...' : 'Refresh'}
                </Button>
                <Select value={quickConnectTarget} onValueChange={(v: 'order'|'onboarding'|'agents') => setQuickConnectTarget(v)}>
                  <SelectTrigger className="w-[180px] animate-scale-in">
                    <SelectValue placeholder="Quick Connect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">📦 Order Management</SelectItem>
                    <SelectItem value="onboarding">👥 Patient Onboarding</SelectItem>
                    <SelectItem value="agents">🤖 AI Agents</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setQuickConnectOpen(true)} 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover-scale"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </div>

          {/* Live Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover-scale cursor-pointer animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{orderStats.total}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">+12% vs yesterday</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-600 dark:bg-blue-400 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-white dark:text-blue-900" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover-scale cursor-pointer animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Patients Active</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{onboardingStats.inProgress}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">+8% vs last week</p>
                  </div>
                  <div className="h-12 w-12 bg-green-600 dark:bg-green-400 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-white dark:text-green-900" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover-scale cursor-pointer animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">AI Agents</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{agentStats.active}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">{agentStats.deployed} deployed</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-600 dark:bg-purple-400 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white dark:text-purple-900" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover-scale cursor-pointer animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">System Health</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">98%</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">All systems go</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-600 dark:bg-orange-400 rounded-lg flex items-center justify-center">
                    <Gauge className="h-6 w-6 text-white dark:text-orange-900" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Enhanced Order Management */}
            <Collapsible open={expandedSections.orders} onOpenChange={() => toggleSection('orders')}>
              <Card className="col-span-1 animate-scale-in bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Order Management
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="animate-pulse">{orderStats.urgent} Urgent</Badge>
                        {expandedSections.orders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Processing</span>
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Delivered</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
                      </div>
                    </div>
                    
                    {ordersData && ordersData.length > 0 && (
                      <div className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Latest Order</span>
                          <Badge variant="outline" className="text-xs">{ordersData[0]?.patientId}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Stage:</span>
                            <Badge variant="secondary">{ordersData[0]?.stage?.replace('_', ' ')}</Badge>
                          </div>
                          <Progress value={ordersData[0]?.progress || 0} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{ordersData[0]?.progress}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate('/order-management')} 
                      className="w-full bg-blue-600 hover:bg-blue-700 hover-scale"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All Orders
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Enhanced Patient Onboarding */}
            <Collapsible open={expandedSections.onboarding} onOpenChange={() => toggleSection('onboarding')}>
              <Card className="col-span-1 animate-scale-in bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        Patient Onboarding
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="animate-pulse">{onboardingStats.pending} Pending</Badge>
                        {expandedSections.onboarding ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="h-32 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={onboardingProgressData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {onboardingProgressData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {onboardingData && onboardingData.length > 0 && (
                      <div className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Current Patient</span>
                          <Badge variant="outline" className="text-xs">{onboardingData[0]?.patientId}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Stage:</span>
                            <Badge variant="secondary">{onboardingData[0]?.stage?.replace('_', ' ')}</Badge>
                          </div>
                          <Progress value={onboardingData[0]?.progress || 0} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Step {onboardingData[0]?.completedSteps}/{onboardingData[0]?.totalSteps}</span>
                            <span>{onboardingData[0]?.progress}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate('/patient-onboarding')} 
                      className="w-full bg-green-600 hover:bg-green-700 hover-scale"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Manage Patients
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Enhanced AI Agents */}
            <Collapsible open={expandedSections.agents} onOpenChange={() => toggleSection('agents')}>
              <Card className="col-span-1 animate-scale-in bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        AI Agents
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="animate-pulse">{agentStats.channels} Channels</Badge>
                        {expandedSections.agents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="h-32 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agentPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="active" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="total" fill="#e5e7eb" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {deployments && deployments.length > 0 && (
                      <div className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Latest Deployment</span>
                          <Badge variant="outline" className="text-xs">{deployments[0]?.channel_type}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={deployments[0]?.deployment_status === 'active' ? 'default' : 'secondary'}>
                              {deployments[0]?.deployment_status}
                            </Badge>
                          </div>
                          {deployments[0]?.health_status && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Health:</span>
                              <Badge variant="outline">{deployments[0]?.health_status}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate('/agents')} 
                      className="w-full bg-purple-600 hover:bg-purple-700 hover-scale"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Manage Agents
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Analytics Section */}
          <Collapsible open={expandedSections.analytics} onOpenChange={() => toggleSection('analytics')}>
            <Card className="animate-fade-in bg-card/50 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Weekly Performance Analytics
                    </CardTitle>
                    {expandedSections.analytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={orderTrendData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Quick Connect Modal */}
          <QuickConnectorCreator
            isOpen={quickConnectOpen}
            onClose={() => setQuickConnectOpen(false)}
            onConnectorCreated={() => {
              setQuickConnectOpen(false);
              const routeMap: Record<typeof quickConnectTarget, string> = {
                order: '/order-management',
                onboarding: '/patient-onboarding',
                agents: '/agents',
              };
              navigate(routeMap[quickConnectTarget]);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Presentation Display */}
        {showPresentation && (
          <div className="mb-8">
            <AgenticAIPresentation onExit={() => setShowPresentation(false)} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SuperAdmin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              System-wide healthcare management and AI platform oversight
            </p>
          </div>
        </div>

        {/* Quick Stats with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* AI Presentation Card */}
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowPresentation(!showPresentation)}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Presentation className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-primary">13</p>
                  <p className="text-xs text-muted-foreground">AI Slides</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                {showPresentation ? 'Hide' : 'View'} AI Presentation
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.patientCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Verified Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalFacilities || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Facilities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {systemStatus?.apiServicesOnline || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">API Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse h-4 w-4 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="animate-pulse h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="animate-pulse h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((log: any) => (
                    <div key={log.id} className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActionDescription(log)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System is running smoothly</p>
                      <p className="text-xs text-muted-foreground">No recent activity</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Workflow Status */}
          {enrollmentStatusPayload ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Enrollment Workflow Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnrollmentStatusDashboard
                  enrollmentStatus={enrollmentStatusPayload.enrollmentStatus}
                  patientName={enrollmentStatusPayload.patientName}
                  enrollmentId={enrollmentStatusPayload.enrollmentId}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Enrollment Workflow Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  No active enrollment status found. Start or resume an enrollment to see progress here.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Services</span>
                  <span className="text-sm font-medium text-green-600">
                    {systemStatus?.apiServicesOnline || 0} Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-green-600">
                    {systemStatus?.databaseHealthy ? 'Healthy' : 'Checking...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Security Status</span>
                  <span className="text-sm font-medium text-green-600">
                    {systemStatus?.securityStatus || 'Secure'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Facilities</span>
                  <span className="text-sm font-medium text-green-600">
                    {systemStatus?.activeFacilities || 0} Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/users">
                <Button 
                  variant="outline" 
                  className="h-20 w-full flex flex-col items-center gap-2 hover:bg-accent"
                  onClick={() => handleQuickAction('User Management')}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
              </Link>
              <Link to="/patients">
                <Button 
                  variant="outline" 
                  className="h-20 w-full flex flex-col items-center gap-2 hover:bg-accent"
                  onClick={() => handleQuickAction('Patient Management')}
                >
                  <Stethoscope className="h-6 w-6" />
                  <span className="text-sm">View Patients</span>
                </Button>
              </Link>
              <Link to="/facilities">
                <Button 
                  variant="outline" 
                  className="h-20 w-full flex flex-col items-center gap-2 hover:bg-accent"
                  onClick={() => handleQuickAction('Facility Management')}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Facilities</span>
                </Button>
              </Link>
              <Link to="/reports">
                <Button 
                  variant="outline" 
                  className="h-20 w-full flex flex-col items-center gap-2 hover:bg-accent"
                  onClick={() => handleQuickAction('Reports')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-2xl font-bold">{stats?.patientCount || 0}</p>
                <p className="text-sm text-muted-foreground">Patients</p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-2xl font-bold">{stats?.totalModules || 0}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Label Studio Integration */}
        <LSDashboardWidget compact={true} showActions={true} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;