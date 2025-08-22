import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database,
  FileText,
  Settings2,
  Puzzle,
  Zap,
  Brain,
  Link,
  Package,
  X,
  ChevronRight,
  Users,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Settings,
  Bot,
  TestTube
} from 'lucide-react';
import { AssetLibraryManager } from './AssetLibraryManager';
import { DataLibrarySelector } from './DataLibrarySelector';
import { VariableEditor } from './VariableEditor';
import { AutoSuggestConnector } from './AutoSuggestConnector';
import { AgentManagerPanel } from './panels/AgentManagerPanel';
import { AIModelsPanel } from './panels/AIModelsPanel';
import { TestingDeploymentPanel } from './panels/TestingDeploymentPanel';
import { SequentialFlowGuide } from './SequentialFlowGuide';
import { WorkflowControls } from './WorkflowControls';

interface WorkflowAssetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode?: any;
  onAssetSelect?: (assets: any[]) => void;
  onDataLibrarySelect?: (libraries: any[]) => void;
  onVariablesChange?: (variables: any[]) => void;
  onSuggestionAccepted?: (suggestion: any) => void;
}

export const WorkflowAssetPanel: React.FC<WorkflowAssetPanelProps> = ({
  isOpen,
  onClose,
  selectedNode,
  onAssetSelect,
  onDataLibrarySelect,
  onVariablesChange,
  onSuggestionAccepted
}) => {
  const [activeTab, setActiveTab] = useState('setup');

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-96 h-[calc(100vh-5rem)]">
      <Card className="h-full shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Workflow Assets & Tools
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <div className="px-4 pb-2 border-b bg-background/50 flex-shrink-0">
            <WorkflowControls
              onSimulate={() => window.dispatchEvent(new CustomEvent('workflow:simulate'))}
              onSave={() => window.dispatchEvent(new CustomEvent('workflow:save'))}
              onLoad={() => window.dispatchEvent(new CustomEvent('workflow:load'))}
              onFitView={() => window.dispatchEvent(new CustomEvent('workflow:fitView'))}
              onDeploy={() => window.dispatchEvent(new CustomEvent('workflow:deploy'))}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pb-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-8 gap-0.5">
                <TabsTrigger value="setup" className="text-xs px-2 h-7">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="models" className="text-xs px-2 h-7">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Models
                </TabsTrigger>
                <TabsTrigger value="access" className="text-xs px-2 h-7">
                  <Puzzle className="h-3 w-3 mr-1" />
                  Access
                </TabsTrigger>
              </TabsList>
              
              {/* Second row of tabs */}
              <TabsList className="grid w-full grid-cols-3 h-8 gap-0.5 mt-1">
                <TabsTrigger value="agents" className="text-xs px-2 h-7">
                  <Bot className="h-3 w-3 mr-1" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="testing" className="text-xs px-2 h-7">
                  <TestTube className="h-3 w-3 mr-1" />
                  Testing
                </TabsTrigger>
                <TabsTrigger value="guide" className="text-xs px-2 h-7">
                  <FileText className="h-3 w-3 mr-1" />
                  Guide
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="setup" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Workflow Setup</span>
                    <Badge variant="secondary" className="text-xs">Configuration</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Configure your workflow foundation: assets, data sources, and variables.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <div className="space-y-4">
                    {/* Asset Library Section */}
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Asset Library</span>
                      </div>
                      <AssetLibraryManager
                        onAssetSelect={onAssetSelect}
                        selectedAssets={[]}
                        mode="select"
                      />
                    </Card>

                    {/* Data Library Section */}
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Data Libraries</span>
                      </div>
                      <DataLibrarySelector
                        onLibrariesSelect={onDataLibrarySelect}
                        selectedLibraries={[]}
                        mode="select"
                      />
                    </Card>

                    {/* Variable Editor Section */}
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Variable Editor</span>
                      </div>
                      <VariableEditor
                        variables={[]}
                        onVariablesChange={onVariablesChange}
                      />
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="models" className="h-full m-0">
                <AIModelsPanel 
                  onModelCreate={(model) => console.log('Create model:', model)}
                  onModelUpdate={(model) => console.log('Update model:', model)}
                />
              </TabsContent>

              <TabsContent value="access" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Puzzle className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Access Manager</span>
                    <Badge variant="secondary" className="text-xs">Security</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Configure workflow elements, permissions, and security access controls.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <div className="space-y-4">
                    {/* Workflow Elements Access */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Workflow Elements
                      </h4>
                      
                      {[
                        { name: 'Nodes', description: 'Access to create and modify workflow nodes', enabled: true },
                        { name: 'Edges', description: 'Connect and disconnect workflow elements', enabled: true },
                        { name: 'Canvas', description: 'Canvas editing and layout permissions', enabled: true },
                        { name: 'MiniMap', description: 'Navigation and overview controls', enabled: true }
                      ].map((element, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{element.name}</p>
                              <p className="text-xs text-muted-foreground">{element.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant={element.enabled ? "default" : "outline"}
                              onClick={() => {/* Toggle access */}}
                            >
                              {element.enabled ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* User Permissions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Permissions
                      </h4>
                      
                      {[
                        { role: 'Admin', users: 2, permissions: ['Full Access', 'User Management'] },
                        { role: 'Editor', users: 5, permissions: ['Edit Workflows', 'View Analytics'] },
                        { role: 'Viewer', users: 12, permissions: ['View Only'] }
                      ].map((role, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{role.role}</Badge>
                                <span className="text-xs text-muted-foreground">{role.users} users</span>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((perm, permIdx) => (
                                <Badge key={permIdx} variant="secondary" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Access Control Actions */}
                    <div className="space-y-2">
                      <Button className="w-full" size="sm">
                        <UserCheck className="h-3 w-3 mr-2" />
                        Grant Access
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <UserX className="h-3 w-3 mr-2" />
                        Revoke Access
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="agents" className="h-full m-0">
                <AgentManagerPanel 
                  onAgentCreate={(agent) => console.log('Create agent:', agent)}
                  onAgentUpdate={(agent) => console.log('Update agent:', agent)}
                />
              </TabsContent>

              <TabsContent value="testing" className="h-full m-0">
                <TestingDeploymentPanel 
                  onTestRun={(test) => console.log('Run test:', test)}
                  onDeploy={(env) => console.log('Deploy to:', env)}
                />
              </TabsContent>

              <TabsContent value="guide" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Workflow Guide</span>
                    <Badge variant="secondary" className="text-xs">Step-by-Step</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Follow the sequential workflow guide from planning to deployment.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <SequentialFlowGuide 
                    currentStep={1}
                    onStepSelect={(step) => {
                      console.log('Selected step:', step);
                      // Navigate to the appropriate tab/section based on step
                      if (step === 1) setActiveTab('setup');
                      else if (step === 2) setActiveTab('models');
                      else if (step === 3) setActiveTab('agents');
                      else if (step === 4) setActiveTab('testing');
                    }}
                  />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};