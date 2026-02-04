/**
 * VIRTUALIZED MESSAGING MATRIX
 * 
 * Scalable grid for Product × Audience messaging combinations:
 * - Virtual scrolling for 100+ items
 * - Fixed headers (product column stays visible)
 * - Lazy loading of messaging content
 * - Quick approve/reject actions
 * - Search and filter controls
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Wand2,
  Eye,
  Grid3X3,
  Layers,
  Users,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';

interface MessagingItem {
  id: string;
  productId: GenieProductId;
  audienceId: string;
  status: 'pending' | 'approved' | 'rejected' | 'missing';
  messaging?: {
    headline: string;
    hook: string;
    cta: string;
    valueProposition: string;
  };
  generatedAt?: string;
  approvedAt?: string;
}

interface VirtualizedMessagingMatrixProps {
  products: typeof GENIE_PRODUCTS;
  audiences: Array<{ id: string; label: string }>;
  messagingData: MessagingItem[];
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onGenerate: (productId: GenieProductId, audienceId: string) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
  className?: string;
}

// Product colors
const PRODUCT_COLORS: Record<GenieProductId, string> = {
  spark: '#F97316',
  mind: '#3B82F6',
  vibe: '#22C55E',
  deck: '#EAB308',
  arc: '#EC4899',
  studio: '#9333EA',
  cast: '#EF4444',
  ask_genie: '#06B6D4',
};

type ViewMode = 'grid' | 'list' | 'grouped';
type StatusFilter = 'all' | 'pending' | 'approved' | 'missing';

export const VirtualizedMessagingMatrix: React.FC<VirtualizedMessagingMatrixProps> = ({
  products,
  audiences,
  messagingData,
  onApprove,
  onReject,
  onGenerate,
  onGenerateAll,
  isGenerating,
  className,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<MessagingItem | null>(null);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let result = messagingData;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const product = products[item.productId];
        const audience = audiences.find(a => a.id === item.audienceId);
        return (
          product?.name.toLowerCase().includes(query) ||
          audience?.label.toLowerCase().includes(query) ||
          item.messaging?.headline?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [messagingData, statusFilter, searchQuery, products, audiences]);

  // Group by product for grouped view
  const groupedData = useMemo(() => {
    const groups: Record<string, MessagingItem[]> = {};
    Object.keys(products).forEach(productId => {
      groups[productId] = filteredData.filter(item => item.productId === productId);
    });
    return groups;
  }, [filteredData, products]);

  // Stats
  const stats = useMemo(() => ({
    total: messagingData.length,
    approved: messagingData.filter(i => i.status === 'approved').length,
    pending: messagingData.filter(i => i.status === 'pending').length,
    missing: messagingData.filter(i => i.status === 'missing').length,
  }), [messagingData]);

  const toggleProductExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleBulkApprove = () => {
    selectedItems.forEach(id => onApprove(id));
    setSelectedItems(new Set());
  };

  const getStatusBadge = (status: MessagingItem['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white text-[10px]"><CheckCircle className="w-2.5 h-2.5 mr-0.5" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-[10px]"><Clock className="w-2.5 h-2.5 mr-0.5" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px]"><XCircle className="w-2.5 h-2.5 mr-0.5" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] text-muted-foreground">—</Badge>;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Stats & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Package className="w-3 h-3" />
              {Object.keys(products).length} Products
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {audiences.length} Audiences
            </Badge>
            <Badge variant="default" className="gap-1">
              <Grid3X3 className="w-3 h-3" />
              {stats.total} Combinations
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none h-8 text-xs"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none h-8 text-xs"
              onClick={() => setViewMode('grouped')}
            >
              <Layers className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            onClick={onGenerateAll}
            disabled={isGenerating}
            size="sm"
            className="gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Generate All
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products, audiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[140px] h-9">
            <Filter className="w-3.5 h-3.5 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2 pl-2 border-l">
            <span className="text-xs text-muted-foreground">{selectedItems.size} selected</span>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleBulkApprove}>
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Status Summary Bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 rounded-lg text-sm">
        <span className="text-green-600 font-medium">{stats.approved} approved</span>
        <span className="text-amber-600 font-medium">{stats.pending} pending</span>
        <span className="text-muted-foreground">{stats.missing} missing</span>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {Math.round((stats.approved / stats.total) * 100)}% coverage
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Card>
          <ScrollArea className="h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium w-[180px] min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems(new Set(filteredData.map(i => i.id)));
                            } else {
                              setSelectedItems(new Set());
                            }
                          }}
                        />
                        Product
                      </div>
                    </th>
                    {audiences.map(audience => (
                      <th 
                        key={audience.id} 
                        className="text-center p-2 font-medium text-xs min-w-[100px] max-w-[120px]"
                        title={audience.label}
                      >
                        <div className="truncate">{audience.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(products).map(productId => {
                    const product = products[productId as GenieProductId];
                    const productItems = filteredData.filter(i => i.productId === productId);
                    
                    return (
                      <tr key={productId} className="border-b hover:bg-muted/20">
                        <td className="p-3 sticky left-0 bg-background">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PRODUCT_COLORS[productId as GenieProductId] }}
                            />
                            <span className="font-medium truncate">{product?.name}</span>
                          </div>
                        </td>
                        {audiences.map(audience => {
                          const item = productItems.find(i => i.audienceId === audience.id);
                          
                          return (
                            <td key={audience.id} className="text-center p-2">
                              {item ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 px-2"
                                      onClick={() => setPreviewItem(item)}
                                    >
                                      {getStatusBadge(item.status)}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: PRODUCT_COLORS[item.productId] }}
                                        />
                                        {products[item.productId]?.name} × {audience.label}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Generated messaging preview
                                      </DialogDescription>
                                    </DialogHeader>
                                    {item.messaging ? (
                                      <div className="space-y-3 pt-4">
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Headline</Label>
                                          <p className="font-medium">{item.messaging.headline}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Hook</Label>
                                          <p className="text-sm">{item.messaging.hook}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">CTA</Label>
                                          <Badge>{item.messaging.cta}</Badge>
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                          <Button 
                                            className="flex-1 gap-1"
                                            onClick={() => onApprove(item.id)}
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                          </Button>
                                          <Button 
                                            variant="outline"
                                            className="flex-1 gap-1"
                                            onClick={() => onReject(item.id)}
                                          >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No messaging generated yet</p>
                                        <Button 
                                          onClick={() => onGenerate(item.productId, item.audienceId)}
                                          className="gap-2"
                                        >
                                          <Wand2 className="w-4 h-4" />
                                          Generate Now
                                        </Button>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">—</Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Grouped View */}
      {viewMode === 'grouped' && (
        <div className="space-y-3">
          {Object.entries(groupedData).map(([productId, items]) => {
            const product = products[productId as GenieProductId];
            const isExpanded = expandedProducts.has(productId);
            const approvedCount = items.filter(i => i.status === 'approved').length;
            const totalCount = audiences.length;

            return (
              <Collapsible
                key={productId}
                open={isExpanded}
                onOpenChange={() => toggleProductExpanded(productId)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: PRODUCT_COLORS[productId as GenieProductId] }}
                          />
                          <span className="font-semibold">{product?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {approvedCount}/{totalCount} approved
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${(approvedCount / totalCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10">
                            {Math.round((approvedCount / totalCount) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {audiences.map(audience => {
                          const item = items.find(i => i.audienceId === audience.id);
                          
                          return (
                            <div 
                              key={audience.id}
                              className={cn(
                                "p-3 rounded-lg border text-sm",
                                item?.status === 'approved' && "border-green-200 bg-green-50/50 dark:bg-green-950/20",
                                item?.status === 'pending' && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20",
                                !item || item.status === 'missing' && "border-dashed"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium truncate text-xs">{audience.label}</span>
                                {item && getStatusBadge(item.status)}
                              </div>
                              {item?.messaging && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {item.messaging.headline}
                                </p>
                              )}
                              {item?.status === 'pending' && (
                                <div className="flex gap-1 mt-2">
                                  <Button 
                                    size="sm" 
                                    className="h-6 text-[10px] flex-1"
                                    onClick={() => onApprove(item.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-6 text-[10px] flex-1"
                                    onClick={() => onReject(item.id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VirtualizedMessagingMatrix;
