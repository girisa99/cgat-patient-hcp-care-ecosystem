/**
 * Table & Chart Editor for Presentations
 * Inline editing for tables and chart visualizations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Grid3X3,
  ArrowUpDown,
  Wand2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableData, TableCell, TableRow, ChartData, ChartType, ChartDataset } from './types';

// Table Editor Component
interface TableEditorProps {
  data?: TableData;
  onUpdate: (data: TableData) => void;
  onGenerateWithAI?: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

export function TableEditor({
  data,
  onUpdate,
  onGenerateWithAI,
  isGenerating = false,
  className
}: TableEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; cellIdx: number } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIInput, setShowAIInput] = useState(false);

  const tableData: TableData = data || {
    headers: [
      { id: 'h1', content: 'Column 1' },
      { id: 'h2', content: 'Column 2' },
      { id: 'h3', content: 'Column 3' }
    ],
    rows: [
      { id: 'r1', cells: [
        { id: 'c1-1', content: 'Cell 1' },
        { id: 'c1-2', content: 'Cell 2' },
        { id: 'c1-3', content: 'Cell 3' }
      ]},
      { id: 'r2', cells: [
        { id: 'c2-1', content: 'Cell 4' },
        { id: 'c2-2', content: 'Cell 5' },
        { id: 'c2-3', content: 'Cell 6' }
      ]}
    ],
    style: {
      headerBackground: 'hsl(var(--primary))',
      headerForeground: 'hsl(var(--primary-foreground))',
      stripedRows: true,
      borders: 'all'
    }
  };

  const updateCell = (rowIdx: number, cellIdx: number, content: string) => {
    const newRows = [...tableData.rows];
    newRows[rowIdx].cells[cellIdx].content = content;
    onUpdate({ ...tableData, rows: newRows });
    setEditingCell(null);
  };

  const updateHeader = (idx: number, content: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[idx].content = content;
    onUpdate({ ...tableData, headers: newHeaders });
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `r${Date.now()}`,
      cells: tableData.headers.map((_, idx) => ({
        id: `c${Date.now()}-${idx}`,
        content: ''
      }))
    };
    onUpdate({ ...tableData, rows: [...tableData.rows, newRow] });
  };

  const addColumn = () => {
    const newHeader: TableCell = { id: `h${Date.now()}`, content: 'New Column' };
    const newRows = tableData.rows.map(row => ({
      ...row,
      cells: [...row.cells, { id: `c${Date.now()}-${row.id}`, content: '' }]
    }));
    onUpdate({ ...tableData, headers: [...tableData.headers, newHeader], rows: newRows });
  };

  const removeRow = (idx: number) => {
    const newRows = tableData.rows.filter((_, i) => i !== idx);
    onUpdate({ ...tableData, rows: newRows });
  };

  const removeColumn = (idx: number) => {
    const newHeaders = tableData.headers.filter((_, i) => i !== idx);
    const newRows = tableData.rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== idx)
    }));
    onUpdate({ ...tableData, headers: newHeaders, rows: newRows });
  };

  const handleAIGenerate = async () => {
    if (onGenerateWithAI && aiPrompt.trim()) {
      await onGenerateWithAI(aiPrompt);
      setAiPrompt('');
      setShowAIInput(false);
    }
  };

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Table</span>
            <Badge variant="outline" className="text-[10px]">
              {tableData.rows.length} rows × {tableData.headers.length} cols
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowAIInput(!showAIInput)}
              title="Generate with AI"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Done editing" : "Edit table"}
            >
              {isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* AI Generation Input */}
        {showAIInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Describe the table data you want..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              size="sm"
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
              className="h-8 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {tableData.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className="border px-2 py-1.5 text-left font-medium"
                    style={{
                      backgroundColor: tableData.style?.headerBackground || 'hsl(var(--primary))',
                      color: tableData.style?.headerForeground || 'hsl(var(--primary-foreground))'
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      {isEditing ? (
                        <Input
                          value={header.content}
                          onChange={(e) => updateHeader(idx, e.target.value)}
                          className="h-6 text-xs bg-transparent border-none p-0 text-inherit"
                        />
                      ) : (
                        <span>{header.content}</span>
                      )}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-50 hover:opacity-100"
                          onClick={() => removeColumn(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
                {isEditing && (
                  <th className="border px-2 py-1.5 w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={addColumn}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIdx) => (
                <tr 
                  key={row.id}
                  className={cn(
                    tableData.style?.stripedRows && rowIdx % 2 === 1 && "bg-muted/30"
                  )}
                >
                  {row.cells.map((cell, cellIdx) => (
                    <td key={cell.id} className="border px-2 py-1.5">
                      {editingCell?.rowIdx === rowIdx && editingCell?.cellIdx === cellIdx ? (
                        <Input
                          value={cell.content}
                          onChange={(e) => {
                            const newRows = [...tableData.rows];
                            newRows[rowIdx].cells[cellIdx].content = e.target.value;
                            onUpdate({ ...tableData, rows: newRows });
                          }}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null);
                          }}
                          className="h-6 text-xs"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={cn(isEditing && "cursor-text hover:bg-muted/50 rounded px-1 -mx-1")}
                          onClick={() => isEditing && setEditingCell({ rowIdx, cellIdx })}
                        >
                          {cell.content || <span className="text-muted-foreground italic">Empty</span>}
                        </span>
                      )}
                    </td>
                  ))}
                  {isEditing && (
                    <td className="border px-2 py-1.5 w-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive"
                        onClick={() => removeRow(rowIdx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={addRow}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Chart Editor Component
interface ChartEditorProps {
  data?: ChartData;
  onUpdate: (data: ChartData) => void;
  onGenerateWithAI?: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

const chartTypeIcons: Record<ChartType, React.ReactNode> = {
  bar: <BarChart3 className="h-4 w-4" />,
  line: <LineChart className="h-4 w-4" />,
  pie: <PieChart className="h-4 w-4" />,
  donut: <PieChart className="h-4 w-4" />,
  area: <TrendingUp className="h-4 w-4" />,
  scatter: <Grid3X3 className="h-4 w-4" />,
  radar: <Grid3X3 className="h-4 w-4" />,
  funnel: <ArrowUpDown className="h-4 w-4" />
};

export function ChartEditor({
  data,
  onUpdate,
  onGenerateWithAI,
  isGenerating = false,
  className
}: ChartEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIInput, setShowAIInput] = useState(false);

  const chartData: ChartData = data || {
    type: 'bar',
    title: 'Sample Chart',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Series 1',
      data: [65, 59, 80, 81, 56],
      color: 'hsl(var(--primary))'
    }],
    options: {
      showLegend: true,
      legendPosition: 'bottom',
      showGrid: true,
      showLabels: true
    }
  };

  const updateChartType = (type: ChartType) => {
    onUpdate({ ...chartData, type });
  };

  const updateLabel = (idx: number, value: string) => {
    const newLabels = [...chartData.labels];
    newLabels[idx] = value;
    onUpdate({ ...chartData, labels: newLabels });
  };

  const updateDataPoint = (datasetIdx: number, dataIdx: number, value: number) => {
    const newDatasets = [...chartData.datasets];
    newDatasets[datasetIdx].data[dataIdx] = value;
    onUpdate({ ...chartData, datasets: newDatasets });
  };

  const addDataPoint = () => {
    const newLabels = [...chartData.labels, `Item ${chartData.labels.length + 1}`];
    const newDatasets = chartData.datasets.map(ds => ({
      ...ds,
      data: [...ds.data, 0]
    }));
    onUpdate({ ...chartData, labels: newLabels, datasets: newDatasets });
  };

  const removeDataPoint = (idx: number) => {
    const newLabels = chartData.labels.filter((_, i) => i !== idx);
    const newDatasets = chartData.datasets.map(ds => ({
      ...ds,
      data: ds.data.filter((_, i) => i !== idx)
    }));
    onUpdate({ ...chartData, labels: newLabels, datasets: newDatasets });
  };

  const handleAIGenerate = async () => {
    if (onGenerateWithAI && aiPrompt.trim()) {
      await onGenerateWithAI(aiPrompt);
      setAiPrompt('');
      setShowAIInput(false);
    }
  };

  // Simple chart visualization
  const maxValue = Math.max(...chartData.datasets.flatMap(ds => ds.data));

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chartTypeIcons[chartData.type]}
            <span className="text-sm font-medium">{chartData.title || 'Chart'}</span>
            <Badge variant="outline" className="text-[10px] capitalize">
              {chartData.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowAIInput(!showAIInput)}
              title="Generate with AI"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Done editing" : "Edit chart"}
            >
              {isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* AI Generation Input */}
        {showAIInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Describe the chart data you want..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              size="sm"
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
              className="h-8 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        )}

        {/* Chart Type Selector (when editing) */}
        {isEditing && (
          <div className="space-y-2">
            <Label className="text-xs">Chart Type</Label>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(chartTypeIcons) as ChartType[]).map((type) => (
                <Button
                  key={type}
                  variant={chartData.type === type ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => updateChartType(type)}
                >
                  {chartTypeIcons[type]}
                  <span className="ml-1 capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Simple Bar Chart Visualization */}
        {(chartData.type === 'bar' || chartData.type === 'line') && (
          <div className="space-y-2">
            {chartData.labels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {isEditing ? (
                  <Input
                    value={label}
                    onChange={(e) => updateLabel(idx, e.target.value)}
                    className="h-6 w-20 text-xs"
                  />
                ) : (
                  <span className="text-xs w-20 truncate">{label}</span>
                )}
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(chartData.datasets[0].data[idx] / maxValue) * 100}%`
                    }}
                  />
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={chartData.datasets[0].data[idx]}
                      onChange={(e) => updateDataPoint(0, idx, parseFloat(e.target.value) || 0)}
                      className="h-6 w-16 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeDataPoint(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-medium w-12 text-right">
                    {chartData.datasets[0].data[idx]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Simple Pie Chart Visualization */}
        {(chartData.type === 'pie' || chartData.type === 'donut') && (
          <div className="flex gap-4">
            <div className="w-24 h-24 relative">
              {/* Simple pie segments */}
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                  let cumulative = 0;
                  return chartData.datasets[0].data.map((value, idx) => {
                    const percentage = (value / total) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -cumulative;
                    cumulative += percentage;
                    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#f59e0b', '#10b981'];
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={colors[idx % colors.length]}
                        strokeWidth={chartData.type === 'donut' ? 15 : 40}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'all 0.3s' }}
                      />
                    );
                  });
                })()}
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              {chartData.labels.map((label, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#f59e0b', '#10b981'][idx % 5] }}
                  />
                  {isEditing ? (
                    <>
                      <Input
                        value={label}
                        onChange={(e) => updateLabel(idx, e.target.value)}
                        className="h-5 flex-1 text-xs"
                      />
                      <Input
                        type="number"
                        value={chartData.datasets[0].data[idx]}
                        onChange={(e) => updateDataPoint(0, idx, parseFloat(e.target.value) || 0)}
                        className="h-5 w-14 text-xs"
                      />
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{label}</span>
                      <span className="font-medium">{chartData.datasets[0].data[idx]}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Data Point Button */}
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={addDataPoint}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Data Point
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
