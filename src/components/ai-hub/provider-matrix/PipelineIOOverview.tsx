/**
 * Pipeline I/O Overview Component
 * 
 * Displays summary statistics for all 119 pipelines across 14 categories
 * with full input/output format coverage
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  Search, 
  FileInput, 
  FileOutput,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { 
  PIPELINE_IO_REGISTRY, 
  PIPELINE_CATEGORY_METADATA,
  getPipelineStats,
  type PipelineIOEntry,
  type PipelineIOCategory,
  type PipelineTier
} from './pipelineIORegistry';

interface PipelineIOOverviewProps {
  showFullTable?: boolean;
}

export const PipelineIOOverview: React.FC<PipelineIOOverviewProps> = ({ 
  showFullTable = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  
  const stats = getPipelineStats();
  
  // Filter pipelines
  const filteredPipelines = PIPELINE_IO_REGISTRY.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pipeline.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pipeline.category === categoryFilter;
    const matchesTier = tierFilter === 'all' || pipeline.tier === tierFilter;
    return matchesSearch && matchesCategory && matchesTier;
  });

  const tierColors: Record<PipelineTier, string> = {
    Starter: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    Pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Pipelines</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Coverage</p>
                <p className="text-2xl font-bold text-green-600">{stats.coveragePercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileInput className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Input Formats</p>
                <p className="text-2xl font-bold">{stats.inputFormatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Output Formats</p>
                <p className="text-2xl font-bold">{stats.outputFormatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">By Tier</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                Starter: {stats.byTier.Starter}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Pro: {stats.byTier.Pro}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Enterprise: {stats.byTier.Enterprise}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            14 Categories - {stats.total} Pipelines (94 Base + 25 Marketing-Specific)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {stats.byCategory.map((cat) => {
              const meta = PIPELINE_CATEGORY_METADATA[cat.category as PipelineIOCategory];
              return (
                <div 
                  key={cat.category}
                  className={`p-2 rounded-lg ${meta?.color || 'bg-gray-100'} text-center`}
                >
                  <p className="text-xs font-medium truncate">{cat.label.replace(/Category \d+: /, '')}</p>
                  <p className="text-lg font-bold">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full Table View */}
      {showFullTable && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <CardTitle className="text-sm font-medium">
                All Pipelines with Input/Output Formats
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pipelines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(PIPELINE_CATEGORY_METADATA).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Input Formats</TableHead>
                    <TableHead>Output Formats</TableHead>
                    <TableHead>Covered</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPipelines.map((pipeline, idx) => (
                    <TableRow key={pipeline.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{pipeline.name}</p>
                          <p className="text-xs text-muted-foreground">{pipeline.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={tierColors[pipeline.tier]}>
                          {pipeline.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pipeline.inputFormats.map((format) => (
                            <Badge 
                              key={format} 
                              variant="outline" 
                              className="text-xs bg-blue-50 dark:bg-blue-900/20"
                            >
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pipeline.outputFormats.map((format) => (
                            <Badge 
                              key={format} 
                              variant="outline" 
                              className="text-xs bg-green-50 dark:bg-green-900/20"
                            >
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pipeline.isCovered ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pipeline.notes && (
                          <Badge variant="secondary" className="text-xs">
                            {pipeline.notes}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="mt-2 text-xs text-muted-foreground text-right">
              Showing {filteredPipelines.length} of {stats.total} pipelines
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PipelineIOOverview;
