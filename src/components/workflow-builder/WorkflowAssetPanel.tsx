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
  Settings
} from 'lucide-react';
import { AssetLibraryManager } from './AssetLibraryManager';
import { DataLibrarySelector } from './DataLibrarySelector';
import { VariableEditor } from './VariableEditor';
import { AutoSuggestConnector } from './AutoSuggestConnector';

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
  const [activeTab, setActiveTab] = useState('assets');

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pb-2">
              <TabsList className="grid w-full grid-cols-6 text-xs">
                <TabsTrigger value="assets" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="variables" className="text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Variables
                </TabsTrigger>
                <TabsTrigger value="connectors" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  Connect
                </TabsTrigger>
                <TabsTrigger value="access" className="text-xs">
                  <Puzzle className="h-3 w-3 mr-1" />
                  Access
                </TabsTrigger>
                <TabsTrigger value="suggest" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="assets" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">Asset Library</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Browse and select assets for your workflow. Works with all models and connectors.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <AssetLibraryManager
                    onAssetSelect={onAssetSelect}
                    selectedAssets={[]}
                    mode="select"
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="font-medium">Data Libraries</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Connect to knowledge bases, databases, and data sources. Compatible with all providers.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <DataLibrarySelector
                    onLibrariesSelect={onDataLibrarySelect}
                    selectedLibraries={[]}
                    mode="select"
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="variables" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Variable Editor</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Define and manage workflow variables. Available for all models and configurations.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <VariableEditor
                    variables={[]}
                    onVariablesChange={onVariablesChange}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="connectors" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Link className="h-4 w-4 text-primary" />
                    <span className="font-medium">Smart Connectors</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Available connectors for all providers: OpenAI, Anthropic, Supabase, Salesforce, and more.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <div className="space-y-3">
                    {/* Universal Connectors */}
                    {[
                      { name: 'OpenAI GPT', type: 'AI Model', status: 'available', icon: Brain },
                      { name: 'Anthropic Claude', type: 'AI Model', status: 'available', icon: Brain },
                      { name: 'Supabase', type: 'Database', status: 'connected', icon: Database },
                      { name: 'Salesforce', type: 'CRM', status: 'available', icon: FileText },
                      { name: 'Stripe', type: 'Payment', status: 'available', icon: Zap },
                      { name: 'Twilio', type: 'Communication', status: 'available', icon: Link },
                      { name: 'SendGrid', type: 'Email', status: 'available', icon: FileText },
                      { name: 'Zoom', type: 'Video', status: 'available', icon: Link }
                    ].map((connector, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              connector.status === 'connected' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              <connector.icon className={`h-4 w-4 ${
                                connector.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{connector.name}</p>
                              <p className="text-xs text-muted-foreground">{connector.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={connector.status === 'connected' ? 'default' : 'outline'} className="text-xs">
                              {connector.status}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="access" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Puzzle className="h-4 w-4 text-primary" />
                    <span className="font-medium">Access Manager</span>
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

              <TabsContent value="suggest" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="font-medium">AI Auto-Suggest</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Get intelligent suggestions for next steps and connections. Works with all workflow types.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <AutoSuggestConnector
                    selectedNode={selectedNode}
                    onSuggestionAccepted={onSuggestionAccepted || (() => {})}
                    capturedRequirements={{
                      connectors: ['OpenAI', 'Supabase', 'Salesforce'],
                      actions: ['Process', 'Analyze', 'Route'],
                      steps: ['Intake', 'Assessment', 'Action'],
                      integrations: ['CRM', 'Database', 'API']
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