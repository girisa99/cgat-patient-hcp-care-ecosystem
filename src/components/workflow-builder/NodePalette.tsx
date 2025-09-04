import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Lightbulb, MapPin, Wand2, Bot, Zap, Plug, Database, 
  MessageCircle, Mic, Users, Rocket, TestTube, Settings,
  CheckSquare, Workflow, Target, ChevronDown, ChevronRight,
  Shield, UserCheck, Building2, Heart, FileText, Share2,
  Twitter, Facebook, Instagram, Linkedin, Youtube, Video,
  Calendar, BarChart3, Play, GitBranch, Activity, DollarSign,
  ShoppingCart, Contact, Code, Box
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';

interface NodePaletteItem {
  id: string;
  type: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: string;
  color: string;
}

export const NodePalette: React.FC<{ heightClass?: string }> = ({ heightClass }) => {
  console.log('[NodePalette] render start - DB-only mode');
  const { categories: dbCategories, nodeTypes: dbNodeTypes, isLoading } = useWorkflowNodes();
  
  // Initialize open categories based on actual DB categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    // Show core workflow and business categories by default
    const defaultOpen = ['triggers', 'actions', 'conditions', 'business_tools', 'healthcare_systems', 'social_media'];
    dbCategories.forEach(cat => {
      initial[cat.name] = defaultOpen.includes(cat.name);
    });
    return initial;
  });
  
  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Icon mapping for business nodes
  const getBusinessNodeIcon = (typeKey: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'npi_validator': UserCheck,
      'cms_provider_lookup': Building2,
      'fda_drug_lookup': Shield,
      'icd10_lookup': FileText,
      'hipaa_compliance_checker': Shield,
      'clinical_decision_support': Heart
    };
    return iconMap[typeKey] || Shield;
  };

  // Enhanced icon mapping for all node types
  const getNodeIcon = (typeKey: string, categoryName: string) => {
    // Social Media Icons
    const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
      'twitter_post': Twitter,
      'twitter_monitor': Twitter,
      'facebook_post': Facebook,
      'instagram_post': Instagram,
      'linkedin_post': Linkedin,
      'youtube_upload': Youtube,
      'tiktok_post': Video,
      'social_scheduler': Calendar,
      'social_analytics': BarChart3
    };
    
    // Business/Healthcare Icons
    const businessIcons: Record<string, React.ComponentType<{ className?: string }>> = {
      'npi_validator': UserCheck,
      'cms_provider_lookup': Building2,
      'fda_drug_lookup': Shield,
      'icd10_lookup': FileText,
      'hipaa_compliance_checker': Shield,
      'clinical_decision_support': Heart
    };
    
    // Category-specific icons
    if (categoryName === 'social_media') return socialIcons[typeKey] || Share2;
    if (categoryName === 'business_tools' || categoryName === 'healthcare_systems') {
      return businessIcons[typeKey] || Shield;
    }
    if (categoryName === 'triggers') return Zap;
    if (categoryName === 'actions') return Play;
    if (categoryName === 'conditions') return GitBranch;
    if (categoryName === 'data') return Database;
    if (categoryName === 'communication') return MessageCircle;
    if (categoryName === 'automation') return Bot;
    if (categoryName === 'security') return Shield;
    if (categoryName === 'finance') return DollarSign;
    if (categoryName === 'hr_management') return Users;
    if (categoryName === 'document_management') return FileText;
    if (categoryName === 'e_commerce') return ShoppingCart;
    if (categoryName === 'project_management') return CheckSquare;
    if (categoryName === 'crm_systems') return Contact;
    if (categoryName === 'development_tools') return Code;
    if (categoryName === 'data_analytics') return BarChart3;
    
    return Settings; // default
  };

  // Convert DB nodes to NodePaletteItem format
  const allNodes = useMemo(() => {
    return dbNodeTypes.map(dbNode => {
      // Get appropriate icon based on category and type
      const IconComponent = getNodeIcon(dbNode.type_key, dbNode.category?.name || 'uncategorized');

      return {
        id: dbNode.id,
        type: dbNode.type_key,
        title: dbNode.display_name,
        icon: IconComponent,
        description: dbNode.description,
        category: dbNode.category?.name || 'uncategorized',
        color: getNodeColor(dbNode.category?.name || 'uncategorized')
      } as NodePaletteItem;
    });
  }, [dbNodeTypes]);

  // Get color for category - Enhanced for all migrated categories
  const getNodeColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      // Core workflow categories
      'triggers': 'bg-red-50 border-red-200 ring-1 ring-red-300',
      'actions': 'bg-green-50 border-green-200 ring-1 ring-green-300',
      'conditions': 'bg-blue-50 border-blue-200 ring-1 ring-blue-300',
      'data': 'bg-purple-50 border-purple-200 ring-1 ring-purple-300',
      
      // Business & Enterprise
      'business_tools': 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300',
      'healthcare_systems': 'bg-red-50 border-red-200 ring-1 ring-red-300',
      'communication': 'bg-cyan-50 border-cyan-200 ring-1 ring-cyan-300',
      'data_analytics': 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-300',
      'automation': 'bg-orange-50 border-orange-200 ring-1 ring-orange-300',
      'security': 'bg-red-50 border-red-200 ring-1 ring-red-300',
      'finance': 'bg-green-50 border-green-200 ring-1 ring-green-300',
      'hr_management': 'bg-purple-50 border-purple-200 ring-1 ring-purple-300',
      'document_management': 'bg-blue-50 border-blue-200 ring-1 ring-blue-300',
      'social_media': 'bg-blue-50 border-blue-200 ring-1 ring-blue-300',
      'e_commerce': 'bg-red-50 border-red-200 ring-1 ring-red-300',
      'project_management': 'bg-green-50 border-green-200 ring-1 ring-green-300',
      'crm_systems': 'bg-pink-50 border-pink-200 ring-1 ring-pink-300',
      'development_tools': 'bg-gray-50 border-gray-200 ring-1 ring-gray-300'
    };
    return colorMap[categoryName] || 'bg-gray-50 border-gray-200';
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    // Standardized drag payload: primary type + JSON meta for config
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ ...data, source: 'node-palette' })
    );
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          Node Palette
        </CardTitle>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Drag & Drop Nodes:</strong>
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                <span><strong>Business Tools</strong> → ICD, NPI, FDA, CMS, HIPAA validation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                <span><strong>Enhanced Nodes</strong> → All-in-one configuration within nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span><strong>Workflow Nodes</strong> → Create executable workflow elements</span>
              </div>
            </div>
          </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pr-3 pb-6 space-y-3">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading business nodes...
              </div>
            ) : (
              dbCategories.map((category) => {
                // Get nodes for this category from DB
                const categoryNodes = allNodes.filter(node => node.category === category.name);
                const isOpen = openCategories[category.name];
              
              return (
                <Collapsible 
                  key={category.name} 
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                       <Badge 
                          variant={['business_tools', 'healthcare_systems', 'triggers', 'actions', 'social_media'].includes(category.name) ? 'default' : 'secondary'} 
                          className={`text-xs ${
                            category.name === 'business_tools' 
                              ? 'bg-emerald-600 text-white border-emerald-700' 
                              : category.name === 'healthcare_systems'
                              ? 'bg-red-600 text-white border-red-700'
                              : category.name === 'triggers'
                              ? 'bg-red-600 text-white border-red-700'
                              : category.name === 'actions'
                              ? 'bg-green-600 text-white border-green-700'
                              : category.name === 'social_media'
                              ? 'bg-blue-600 text-white border-blue-700'
                              : 'bg-secondary'
                          }`}
                        >
                          {category.display_name}
                          {['business_tools', 'healthcare_systems'].includes(category.name) && (
                            <Shield className="h-3 w-3 ml-1" />
                          )}
                          {category.name === 'triggers' && <Zap className="h-3 w-3 ml-1" />}
                          {category.name === 'actions' && <Play className="h-3 w-3 ml-1" />}
                          {category.name === 'social_media' && <Share2 className="h-3 w-3 ml-1" />}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({categoryNodes.length})
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="space-y-2">
                      {categoryNodes.map((node) => (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, node.type, {
                            label: node.title,
                            type: node.type.includes('Node') ? node.id : node.type,
                            category: node.category,
                            isWorkflowNode: !node.type.includes('Node'),
                            configType: node.type.includes('Node') ? node.type : undefined
                          })}
                           className={`
                              p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing
                              hover:shadow-sm transition-all duration-200 hover:scale-[1.01]
                              ${node.color} ${!node.type.includes('Node') ? 'ring-1 ring-primary/20' : ''}
                              ${['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) ? 'ring-2 ring-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50' : ''}
                              ${category.name === 'business_tools' ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-sm' : ''}
                            `}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-white rounded-md shadow-sm flex-shrink-0">
                              <node.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-medium text-sm text-foreground flex items-center gap-1 flex-wrap">
                                  {node.title}
                                  {category.name === 'business_tools' && (
                                    <Badge variant="default" className="text-xs px-1 py-0 bg-emerald-600 text-white">Business</Badge>
                                  )}
                                  {['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) && (
                                    <Badge variant="default" className="text-xs px-1 py-0 bg-indigo-500">Enhanced</Badge>
                                  )}
                                  {!node.type.includes('Node') && !['aiIntelligence', 'agentNode', 'dataSource'].includes(node.type) && category.name !== 'business_tools' && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Workflow</Badge>
                                  )}
                                  {node.type.includes('Node') && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">Config</Badge>
                                  )}
                               </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {node.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};