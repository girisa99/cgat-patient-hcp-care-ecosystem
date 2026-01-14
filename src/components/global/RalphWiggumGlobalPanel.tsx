/**
 * Ralph Wiggum Global Floating Panel
 * Dev-only UI/UX review panel accessible from all pages
 * Now draggable and consolidated with all features
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bug,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Map,
  Eye,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useRalphWiggumGlobal, FindingStatus, FindingType, RalphFinding } from '@/contexts/RalphWiggumContext';
import { toast } from 'sonner';

// DEV-ONLY check
const isDev = import.meta.env.DEV;

// Status colors and icons
const statusConfig: Record<FindingStatus, { color: string; icon: React.ReactNode; label: string }> = {
  new: { color: 'bg-blue-500', icon: <Eye className="h-3 w-3" />, label: 'New' },
  acknowledged: { color: 'bg-yellow-500', icon: <Eye className="h-3 w-3" />, label: 'Acknowledged' },
  in_progress: { color: 'bg-orange-500', icon: <Clock className="h-3 w-3" />, label: 'In Progress' },
  fixed: { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Fixed' },
  verified: { color: 'bg-emerald-600', icon: <CheckCircle className="h-3 w-3" />, label: 'Verified' },
  wont_fix: { color: 'bg-gray-500', icon: <X className="h-3 w-3" />, label: "Won't Fix" },
  duplicate: { color: 'bg-purple-500', icon: <Copy className="h-3 w-3" />, label: 'Duplicate' }
};

const typeConfig: Record<FindingType, { color: string; icon: React.ReactNode; label: string }> = {
  critical: { color: 'text-red-500', icon: <AlertCircle className="h-4 w-4" />, label: 'Critical' },
  warning: { color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4" />, label: 'Warning' },
  suggestion: { color: 'text-blue-500', icon: <Lightbulb className="h-4 w-4" />, label: 'Suggestion' },
  journey: { color: 'text-purple-500', icon: <Map className="h-4 w-4" />, label: 'Journey' }
};

// Page route display names
const pageNames: Record<string, string> = {
  '/genie-studio': 'Genie Studio',
  '/genie-vibe': 'Genie Vibe',
  '/genie-spark': 'Genie Spark',
  '/genie-mind': 'Genie Mind',
  '/genie-arc': 'Genie Arc',
  '/production-hub': 'Production Hub',
  '/agents': 'Agents',
  '/admin': 'Admin',
  '/login': 'Login',
  '/genie-studio-pricing': 'Pricing',
  '/genie-studio-auth': 'Auth'
};

interface FindingCardProps {
  finding: RalphFinding;
  onStatusChange: (status: FindingStatus) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const FindingCard: React.FC<FindingCardProps> = ({ 
  finding, 
  onStatusChange, 
  onDelete,
  isExpanded,
  onToggleExpand 
}) => {
  const typeInfo = typeConfig[finding.finding_type];
  const statusInfo = statusConfig[finding.status];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg p-3 bg-card hover:bg-accent/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{finding.title}</h4>
              <Badge variant="outline" className={`${statusInfo.color} text-white text-xs px-1.5 py-0`}>
                {statusInfo.label}
              </Badge>
              {finding.occurrence_count > 1 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  ×{finding.occurrence_count}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pageNames[finding.page_route] || finding.page_route} • {finding.module_name}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 shrink-0"
          onClick={onToggleExpand}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t space-y-3">
              <p className="text-sm text-muted-foreground">{finding.description}</p>
              
              {finding.recommendation && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-xs font-medium mb-1">Recommendation:</p>
                  <p className="text-xs text-muted-foreground">{finding.recommendation}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={finding.status}
                  onValueChange={(value) => onStatusChange(value as FindingStatus)}
                >
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <span className="flex items-center gap-1">
                          {config.icon} {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>First seen: {new Date(finding.first_detected_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>Last seen: {new Date(finding.last_seen_at).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const RalphWiggumGlobalPanel: React.FC = () => {
  const location = useLocation();
  const {
    findings,
    isLoading,
    isPanelOpen,
    togglePanel,
    closePanel,
    refreshFindings,
    updateFindingStatus,
    deleteFinding,
    exportFindings,
    stats
  } = useRalphWiggumGlobal();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'stats'>('current');
  const [filterType, setFilterType] = useState<FindingType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FindingStatus | 'all'>('all');
  
  // Drag controls for the panel
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Don't render in production
  if (!isDev) return null;
  
  const currentRoute = location.pathname;
  
  // Filter findings
  const filteredFindings = useMemo(() => {
    let result = findings;
    
    if (activeTab === 'current') {
      result = result.filter(f => f.page_route === currentRoute);
    }
    
    if (filterType !== 'all') {
      result = result.filter(f => f.finding_type === filterType);
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(f => f.status === filterStatus);
    }
    
    return result;
  }, [findings, activeTab, currentRoute, filterType, filterStatus]);
  
  const handleExport = useCallback(async (format: 'json' | 'markdown' | 'lovable') => {
    const content = await exportFindings(format);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(content);
    toast.success(`Exported ${findings.length} findings to clipboard as ${format.toUpperCase()}`);
    
    // Also download as file
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ralph-wiggum-findings-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportFindings, findings.length]);
  
  // Floating toggle button - positioned on the LEFT to avoid overlapping with Ask Genie on the right
  const ToggleButton = (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 left-6 z-[9999]"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={togglePanel}
              className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              <Bug className="h-6 w-6 text-white" />
              {stats.byStatus.new > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.byStatus.new}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Ralph Wiggum (Dev Only)</p>
            <p className="text-xs text-muted-foreground">{stats.total} findings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
  
  if (!isPanelOpen) {
    return ToggleButton;
  }
  
  return (
    <>
      {/* Drag constraints container - covers the viewport */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-0 pointer-events-none z-[9997]"
      />
      
      {ToggleButton}
      
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.9 }}
        animate={{ x: dragPosition.x, y: dragPosition.y, opacity: 1, scale: 1 }}
        onDragEnd={(_, info) => {
          setDragPosition(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y
          }));
        }}
        className="fixed bottom-20 left-6 z-[9998] w-96 max-h-[80vh] pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <Card className="shadow-2xl border-2 overflow-hidden">
          <CardHeader 
            className="py-2 px-3 bg-gradient-to-r from-yellow-400 to-orange-500 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-white/70" />
                <Bug className="h-4 w-4 text-white" />
                <CardTitle className="text-sm text-white">Ralph Wiggum</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {stats.total} findings
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={closePanel}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Current page indicator */}
            {!isMinimized && (
              <p className="text-xs text-white/80 mt-1">
                📍 {pageNames[currentRoute] || currentRoute}
              </p>
            )}
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0 max-h-[60vh] flex flex-col">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
                <div className="px-3 pt-2 border-b">
                  <TabsList className="w-full h-8">
                    <TabsTrigger value="current" className="flex-1 text-xs">
                      This Page ({findings.filter(f => f.page_route === currentRoute).length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex-1 text-xs">
                      All ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex-1 text-xs">
                      Stats
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Filters */}
                {activeTab !== 'stats' && (
                  <div className="px-3 py-2 border-b flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <Select value={filterType} onValueChange={(v) => setFilterType(v as FindingType | 'all')}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All Types</SelectItem>
                        {Object.entries(typeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            <span className="flex items-center gap-1">
                              {config.icon} {config.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FindingStatus | 'all')}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All Status</SelectItem>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            <span className="flex items-center gap-1">
                              {config.icon} {config.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Findings list */}
                <TabsContent value="current" className="flex-1 m-0 min-h-0">
                  <ScrollArea className="h-[40vh] overflow-x-auto">
                    <div className="p-3 space-y-2 min-w-[350px]">
                      {filteredFindings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No findings for this page</p>
                          <p className="text-xs">Run an analysis to check for issues</p>
                        </div>
                      ) : (
                        filteredFindings.map((finding) => (
                          <FindingCard
                            key={finding.id}
                            finding={finding}
                            onStatusChange={(status) => updateFindingStatus(finding.id, status)}
                            onDelete={() => deleteFinding(finding.id)}
                            isExpanded={expandedId === finding.id}
                            onToggleExpand={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="all" className="flex-1 m-0 min-h-0">
                  <ScrollArea className="h-[40vh] overflow-x-auto">
                    <div className="p-3 space-y-2 min-w-[350px]">
                      {filteredFindings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No findings yet</p>
                        </div>
                      ) : (
                        filteredFindings.map((finding) => (
                          <FindingCard
                            key={finding.id}
                            finding={finding}
                            onStatusChange={(status) => updateFindingStatus(finding.id, status)}
                            onDelete={() => deleteFinding(finding.id)}
                            isExpanded={expandedId === finding.id}
                            onToggleExpand={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="stats" className="flex-1 m-0 min-h-0">
                  <ScrollArea className="h-[40vh] overflow-x-auto">
                    <div className="p-3 space-y-4 min-w-[350px]">
                      {/* By Status */}
                      <div>
                        <h4 className="text-xs font-medium mb-2">By Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(stats.byStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                              <span className="flex items-center gap-1 text-xs">
                                {statusConfig[status as FindingStatus].icon}
                                {statusConfig[status as FindingStatus].label}
                              </span>
                              <Badge variant="secondary" className="text-xs">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* By Type */}
                      <div>
                        <h4 className="text-xs font-medium mb-2">By Type</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(stats.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                              <span className={`flex items-center gap-1 text-xs ${typeConfig[type as FindingType].color}`}>
                                {typeConfig[type as FindingType].icon}
                                {typeConfig[type as FindingType].label}
                              </span>
                              <Badge variant="secondary" className="text-xs">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* By Page */}
                      <div>
                        <h4 className="text-xs font-medium mb-2">By Page</h4>
                        <div className="space-y-1">
                          {Object.entries(stats.byPage).map(([route, count]) => (
                            <div key={route} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                              <span className="text-xs truncate">{pageNames[route] || route}</span>
                              <Badge variant="secondary" className="text-xs shrink-0">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              {/* Actions */}
              <div className="p-2 border-t bg-muted/30 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => refreshFindings()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleExport('markdown')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export MD
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs bg-gradient-to-r from-pink-500 to-violet-500"
                    onClick={() => handleExport('lovable')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Share to Lovable
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </>
  );
};

export default RalphWiggumGlobalPanel;
