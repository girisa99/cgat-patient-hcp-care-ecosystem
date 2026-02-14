/**
 * MessagingDataTable - Filterable table/grid for messaging review & approval
 * 
 * Follows the Parent→Child versioning model:
 * - English master as parent row
 * - Regional variants as expandable children
 * - Version history per item
 * 
 * Flat with powerful filters: product, region, status, version
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Eye,
  Copy,
  RotateCcw,
  Globe,
  Layers,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────

export type MessagingStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface MessagingVersion {
  version: number;
  messaging: any;
  status: MessagingStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedReason?: string;
}

export interface MessagingEntry {
  id: string;
  productId: GenieProductId;
  audienceId: string;
  audienceLabel: string;
  regionCode: string; // 'en_master' for English master
  regionLabel: string;
  status: MessagingStatus;
  currentVersion: number;
  versions: MessagingVersion[];
  messaging?: any; // current version messaging
  isRegionalChild?: boolean;
  parentId?: string; // links to English master entry
  createdAt: string;
  requestId?: string; // for approval actions
}

interface MessagingDataTableProps {
  entries: MessagingEntry[];
  onApprove?: (entryId: string, requestId?: string) => void;
  onReject?: (entryId: string, requestId?: string, reason?: string) => void;
  onRegenerate?: (entryId: string, productId: GenieProductId, audienceId: string) => void;
  onViewDetail?: (entry: MessagingEntry) => void;
  isGenerating?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

// Product colors
const PRODUCT_COLORS: Record<string, string> = {
  spark: '#F97316', mind: '#3B82F6', vibe: '#22C55E', deck: '#EAB308',
  arc: '#EC4899', studio: '#9333EA', cast: '#EF4444', ask_genie: '#06B6D4',
};

const STATUS_CONFIG: Record<MessagingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: <Layers className="w-3 h-3" /> },
};

export const MessagingDataTable: React.FC<MessagingDataTableProps> = ({
  entries,
  onApprove,
  onReject,
  onRegenerate,
  onViewDetail,
  isGenerating = false,
  showActions = true,
  emptyMessage = 'No messaging items',
  emptyIcon,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'product' | 'status' | 'date' | 'version'>('product');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Expandable rows (parent→child)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  
  // Detail dialog
  const [detailEntry, setDetailEntry] = useState<MessagingEntry | null>(null);

  // Unique values for filter dropdowns
  const uniqueProducts = useMemo(() => {
    const ids = [...new Set(entries.map(e => e.productId))];
    return ids.map(id => ({ id, name: GENIE_PRODUCTS[id]?.name || id }));
  }, [entries]);

  const uniqueRegions = useMemo(() => {
    const regions = [...new Set(entries.map(e => e.regionCode))];
    return regions.map(code => {
      const entry = entries.find(e => e.regionCode === code);
      return { code, label: entry?.regionLabel || code };
    });
  }, [entries]);

  // Group entries by parent (English master → regional children)
  const groupedEntries = useMemo(() => {
    const parents = entries.filter(e => !e.isRegionalChild);
    const children = entries.filter(e => e.isRegionalChild);
    
    return parents.map(parent => ({
      parent,
      children: children.filter(c => c.parentId === parent.id),
    }));
  }, [entries]);

  // Filtered & sorted
  const filteredGroups = useMemo(() => {
    return groupedEntries.filter(group => {
      const e = group.parent;
      
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          e.productId.toLowerCase().includes(q) ||
          e.audienceLabel.toLowerCase().includes(q) ||
          e.regionLabel.toLowerCase().includes(q) ||
          e.messaging?.headline?.toLowerCase().includes(q) ||
          e.messaging?.hook?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      
      // Product filter
      if (filterProduct !== 'all' && e.productId !== filterProduct) return false;
      
      // Status filter
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      
      // Region filter
      if (filterRegion !== 'all' && e.regionCode !== filterRegion) {
        // Also check if any child matches
        const childMatch = group.children.some(c => c.regionCode === filterRegion);
        if (!childMatch) return false;
      }
      
      return true;
    }).sort((a, b) => {
      const aE = a.parent;
      const bE = b.parent;
      let cmp = 0;
      switch (sortBy) {
        case 'product': cmp = aE.productId.localeCompare(bE.productId); break;
        case 'status': cmp = aE.status.localeCompare(bE.status); break;
        case 'date': cmp = new Date(aE.createdAt).getTime() - new Date(bE.createdAt).getTime(); break;
        case 'version': cmp = aE.currentVersion - bE.currentVersion; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [groupedEntries, searchQuery, filterProduct, filterStatus, filterRegion, sortBy, sortDir]);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedEntries.size === filteredGroups.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredGroups.map(g => g.parent.id)));
    }
  }, [filteredGroups, selectedEntries]);

  const handleBulkApprove = useCallback(() => {
    selectedEntries.forEach(id => {
      const entry = entries.find(e => e.id === id);
      if (entry && entry.status === 'pending' && onApprove) {
        onApprove(id, entry.requestId);
      }
    });
    setSelectedEntries(new Set());
    toast.success(`Approved ${selectedEntries.size} items`);
  }, [selectedEntries, entries, onApprove]);

  const copyMessaging = useCallback((messaging: any) => {
    const text = [
      `Headline: ${messaging.headline}`,
      `Hook: ${messaging.hook}`,
      `CTA: ${messaging.cta}`,
      `Value Prop: ${messaging.valueProposition}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Messaging copied');
  }, []);

  const toggleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }, [sortBy]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {emptyIcon || <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const pendingSelected = [...selectedEntries].filter(id => {
    const e = entries.find(x => x.id === id);
    return e?.status === 'pending';
  });

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filters + Bulk Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search headline, hook, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent className="z-[100000]">
            <SelectItem value="all">All Products</SelectItem>
            {uniqueProducts.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRODUCT_COLORS[p.id] }} />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="z-[100000]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent className="z-[100000]">
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map(r => (
              <SelectItem key={r.code} value={r.code}>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  {r.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bulk Actions */}
        {selectedEntries.size > 0 && showActions && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="text-xs">
              {selectedEntries.size} selected
            </Badge>
            {pendingSelected.length > 0 && onApprove && (
              <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleBulkApprove}>
                <CheckCircle className="w-3 h-3" />
                Approve ({pendingSelected.length})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{filteredGroups.length} items</span>
        <span>•</span>
        <span className="text-green-600">{entries.filter(e => e.status === 'approved').length} approved</span>
        <span className="text-amber-600">{entries.filter(e => e.status === 'pending').length} pending</span>
        <span className="text-red-600">{entries.filter(e => e.status === 'rejected').length} rejected</span>
      </div>

      {/* Table */}
      <ScrollArea className="h-[550px]">
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[32px_32px_1.5fr_1fr_1fr_80px_80px_140px] gap-0 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
            <div className="p-2 flex items-center justify-center">
              <Checkbox
                checked={selectedEntries.size === filteredGroups.length && filteredGroups.length > 0}
                onCheckedChange={selectAll}
              />
            </div>
            <div className="p-2" /> {/* expand toggle */}
            <button className="p-2 text-left flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('product')}>
              Product / Audience
              {sortBy === 'product' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <div className="p-2">Headline</div>
            <div className="p-2">Hook / CTA</div>
            <button className="p-2 text-left flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('version')}>
              Ver.
              {sortBy === 'version' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <button className="p-2 text-left flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('status')}>
              Status
              {sortBy === 'status' && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <div className="p-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          {filteredGroups.map(({ parent, children }) => {
            const isExpanded = expandedRows.has(parent.id);
            const hasChildren = children.length > 0;
            const statusCfg = STATUS_CONFIG[parent.status];

            return (
              <React.Fragment key={parent.id}>
                {/* Parent row */}
                <div className={cn(
                  "grid grid-cols-[32px_32px_1.5fr_1fr_1fr_80px_80px_140px] gap-0 border-b items-center text-sm hover:bg-muted/30 transition-colors",
                  parent.status === 'pending' && "bg-amber-50/20 dark:bg-amber-950/10",
                )}>
                  <div className="p-2 flex items-center justify-center">
                    <Checkbox
                      checked={selectedEntries.has(parent.id)}
                      onCheckedChange={() => toggleSelect(parent.id)}
                    />
                  </div>
                  <div className="p-2 flex items-center justify-center">
                    {hasChildren ? (
                      <button onClick={() => toggleRow(parent.id)} className="hover:bg-muted rounded p-0.5">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <span className="w-3.5" />
                    )}
                  </div>
                  <div className="p-2 flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PRODUCT_COLORS[parent.productId] }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{GENIE_PRODUCTS[parent.productId]?.name || parent.productId}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{parent.audienceLabel}</p>
                    </div>
                    {parent.regionCode !== 'en_master' && (
                      <Badge variant="outline" className="text-[9px] shrink-0 gap-0.5">
                        <Globe className="w-2.5 h-2.5" />
                        {parent.regionLabel}
                      </Badge>
                    )}
                    {hasChildren && (
                      <Badge variant="secondary" className="text-[9px] shrink-0">
                        +{children.length} regions
                      </Badge>
                    )}
                  </div>
                  <div className="p-2 min-w-0">
                    <p className="text-xs truncate">{parent.messaging?.headline || '—'}</p>
                  </div>
                  <div className="p-2 min-w-0">
                    <p className="text-[10px] truncate text-muted-foreground">{parent.messaging?.hook || '—'}</p>
                    {parent.messaging?.cta && (
                      <Badge variant="outline" className="text-[9px] mt-0.5">{parent.messaging.cta}</Badge>
                    )}
                  </div>
                  <div className="p-2">
                    <Badge variant="outline" className="text-[10px]">v{parent.currentVersion}</Badge>
                  </div>
                  <div className="p-2">
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium", statusCfg.color)}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="p-2 flex items-center gap-1 justify-end">
                    {showActions && (
                      <>
                        {parent.messaging && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailEntry(parent)} title="View detail">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {parent.messaging && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyMessaging(parent.messaging)} title="Copy">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onRegenerate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onRegenerate(parent.id, parent.productId, parent.audienceId)}
                            disabled={isGenerating}
                            title="Regenerate"
                          >
                            <RotateCcw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                          </Button>
                        )}
                        {parent.status === 'pending' && onApprove && (
                          <Button
                            size="sm"
                            className="h-7 text-[10px] gap-1 px-2"
                            onClick={() => onApprove(parent.id, parent.requestId)}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </Button>
                        )}
                        {parent.status === 'pending' && onReject && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onReject(parent.id, parent.requestId, 'Not suitable')}
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Children rows (regional variants) */}
                {isExpanded && children.map(child => {
                  const childStatusCfg = STATUS_CONFIG[child.status];
                  return (
                    <div
                      key={child.id}
                      className="grid grid-cols-[32px_32px_1.5fr_1fr_1fr_80px_80px_140px] gap-0 border-b items-center text-sm bg-muted/10 hover:bg-muted/20"
                    >
                      <div className="p-2" />
                      <div className="p-2 flex justify-center">
                        <div className="w-4 border-l-2 border-b-2 border-muted-foreground/30 h-3 ml-1" />
                      </div>
                      <div className="p-2 flex items-center gap-2 pl-6 min-w-0">
                        <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs truncate">{child.regionLabel}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{child.audienceLabel}</p>
                        </div>
                      </div>
                      <div className="p-2 min-w-0">
                        <p className="text-xs truncate">{child.messaging?.headline || '—'}</p>
                      </div>
                      <div className="p-2 min-w-0">
                        <p className="text-[10px] truncate text-muted-foreground">{child.messaging?.hook || '—'}</p>
                      </div>
                      <div className="p-2">
                        <Badge variant="outline" className="text-[10px]">v{child.currentVersion}</Badge>
                      </div>
                      <div className="p-2">
                        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium", childStatusCfg.color)}>
                          {childStatusCfg.icon}
                          {childStatusCfg.label}
                        </span>
                      </div>
                      <div className="p-2 flex items-center gap-1 justify-end">
                        {showActions && (
                          <>
                            {child.messaging && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailEntry(child)} title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {child.status === 'pending' && onApprove && (
                              <Button size="sm" className="h-7 text-[10px] gap-1 px-2" onClick={() => onApprove(child.id, child.requestId)}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            {onRegenerate && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRegenerate(child.id, child.productId, child.audienceId)} disabled={isGenerating}>
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={!!detailEntry} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailEntry && (
                <>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRODUCT_COLORS[detailEntry.productId] }} />
                  {GENIE_PRODUCTS[detailEntry.productId]?.name} — {detailEntry.audienceLabel}
                  {detailEntry.regionCode !== 'en_master' && (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="w-3 h-3" />
                      {detailEntry.regionLabel}
                    </Badge>
                  )}
                  <Badge variant="outline" className="ml-auto">v{detailEntry.currentVersion}</Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {detailEntry?.messaging && (
            <div className="space-y-4">
              {/* Headline & Hook */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Headline</h4>
                <p className="text-sm bg-muted/50 p-3 rounded">{detailEntry.messaging.headline}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Hook</h4>
                <p className="text-sm bg-muted/50 p-3 rounded">{detailEntry.messaging.hook}</p>
              </div>
              {detailEntry.messaging.subHook && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sub-Hook</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">{detailEntry.messaging.subHook}</p>
                </div>
              )}
              {/* CTAs */}
              <div className="flex gap-3">
                <Badge className="bg-green-500">{detailEntry.messaging.cta}</Badge>
                {detailEntry.messaging.ctaSecondary && (
                  <Badge variant="outline">{detailEntry.messaging.ctaSecondary}</Badge>
                )}
              </div>
              {/* Value Prop */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Value Proposition</h4>
                <p className="text-sm bg-primary/5 p-3 rounded border border-primary/10">{detailEntry.messaging.valueProposition}</p>
              </div>
              {/* Lists */}
              <div className="grid grid-cols-3 gap-3">
                {detailEntry.messaging.painPoints?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-1 text-red-600">Pain Points</h5>
                    <ul className="space-y-0.5">
                      {detailEntry.messaging.painPoints.map((p: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailEntry.messaging.benefits?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-1 text-green-600">Benefits</h5>
                    <ul className="space-y-0.5">
                      {detailEntry.messaging.benefits.map((b: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground">✓ {b}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailEntry.messaging.differentiators?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-1 text-blue-600">Differentiators</h5>
                    <ul className="space-y-0.5">
                      {detailEntry.messaging.differentiators.map((d: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground">★ {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Scripts */}
              {(detailEntry.messaging.shortScript || detailEntry.messaging.mediumScript || detailEntry.messaging.longScript) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Scripts</h4>
                  {detailEntry.messaging.shortScript && (
                    <div>
                      <Badge variant="secondary" className="text-[10px] mb-1">30s</Badge>
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{detailEntry.messaging.shortScript}</p>
                    </div>
                  )}
                  {detailEntry.messaging.mediumScript && (
                    <div>
                      <Badge variant="secondary" className="text-[10px] mb-1">60s</Badge>
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{detailEntry.messaging.mediumScript}</p>
                    </div>
                  )}
                </div>
              )}
              {/* Version History */}
              {detailEntry.versions.length > 1 && (
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-sm font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Version History ({detailEntry.versions.length})
                  </h4>
                  <div className="space-y-1">
                    {detailEntry.versions.map(v => (
                      <div key={v.version} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                        <Badge variant={v.version === detailEntry.currentVersion ? 'default' : 'outline'} className="text-[10px]">
                          v{v.version}
                        </Badge>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px]",
                          STATUS_CONFIG[v.status].color,
                        )}>
                          {v.status}
                        </span>
                        <span className="text-muted-foreground ml-auto">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => copyMessaging(detailEntry.messaging)}>
                    <Copy className="w-3 h-3" /> Copy All
                  </Button>
                  {onRegenerate && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                      onRegenerate(detailEntry.id, detailEntry.productId, detailEntry.audienceId);
                      setDetailEntry(null);
                    }}>
                      <RotateCcw className="w-3 h-3" /> Regenerate
                    </Button>
                  )}
                  {detailEntry.status === 'pending' && onApprove && (
                    <Button size="sm" className="gap-1 ml-auto" onClick={() => {
                      onApprove(detailEntry.id, detailEntry.requestId);
                      setDetailEntry(null);
                    }}>
                      <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingDataTable;
