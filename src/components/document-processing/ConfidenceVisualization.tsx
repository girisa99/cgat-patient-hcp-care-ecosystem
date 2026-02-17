/**
 * Confidence Visualization Component
 * Improvement 4: Field-level confidence charts and visual breakdown
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  CheckCircle, AlertTriangle, AlertCircle, TrendingUp, 
  BarChart3, Target, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldData {
  fieldName: string;
  value: string;
  confidence: number;
  source?: 'ocr' | 'vision_ai' | 'nlp';
  verified?: boolean;
}

interface ConfidenceVisualizationProps {
  extractedFields: Record<string, { value: string; confidence: number; source?: string; verified?: boolean }>;
  className?: string;
  compact?: boolean;
}

const CONFIDENCE_COLORS = {
  high: '#22C55E',    // green-500
  medium: '#F59E0B',  // amber-500
  low: '#EF4444',     // red-500
};

const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
};

const getConfidenceColor = (confidence: number): string => {
  return CONFIDENCE_COLORS[getConfidenceLevel(confidence)];
};

export const ConfidenceVisualization: React.FC<ConfidenceVisualizationProps> = ({
  extractedFields,
  className,
  compact = false
}) => {
  // Process fields data
  const fieldsData = useMemo(() => {
    const excludedFields = ['_meta', 'line_items', 'tables', 'raw_text', 'detected_document_type', 'document_category'];
    
    return Object.entries(extractedFields)
      .filter(([key]) => !key.startsWith('_') && !excludedFields.includes(key))
      .map(([fieldName, data]) => ({
        fieldName: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        rawName: fieldName,
        value: data.value,
        confidence: data.confidence,
        source: data.source as 'ocr' | 'vision_ai' | 'nlp' | undefined,
        verified: data.verified,
        color: getConfidenceColor(data.confidence)
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }, [extractedFields]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (fieldsData.length === 0) {
      return { 
        total: 0, 
        high: 0, 
        medium: 0, 
        low: 0, 
        avgConfidence: 0, 
        verified: 0 
      };
    }

    const high = fieldsData.filter(f => f.confidence >= 0.9).length;
    const medium = fieldsData.filter(f => f.confidence >= 0.7 && f.confidence < 0.9).length;
    const low = fieldsData.filter(f => f.confidence < 0.7).length;
    const verified = fieldsData.filter(f => f.verified).length;
    const avgConfidence = fieldsData.reduce((sum, f) => sum + f.confidence, 0) / fieldsData.length;

    return { total: fieldsData.length, high, medium, low, avgConfidence, verified };
  }, [fieldsData]);

  // Distribution data for pie chart
  const distributionData = [
    { name: 'High (≥90%)', value: stats.high, color: CONFIDENCE_COLORS.high },
    { name: 'Medium (70-89%)', value: stats.medium, color: CONFIDENCE_COLORS.medium },
    { name: 'Low (<70%)', value: stats.low, color: CONFIDENCE_COLORS.low },
  ].filter(d => d.value > 0);

  // Bar chart data (top 10 fields by confidence)
  const barChartData = fieldsData.slice(0, 10).map(f => ({
    name: f.fieldName.length > 12 ? f.fieldName.substring(0, 12) + '...' : f.fieldName,
    confidence: Math.round(f.confidence * 100),
    fill: f.color
  }));

  // Radial chart for overall score
  const radialData = [
    { name: 'Confidence', value: Math.round(stats.avgConfidence * 100), fill: getConfidenceColor(stats.avgConfidence) }
  ];

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Confidence Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Overall score */}
          <div className="flex items-center justify-center">
            <div 
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                background: `conic-gradient(${getConfidenceColor(stats.avgConfidence)} ${stats.avgConfidence * 360}deg, #e5e7eb ${stats.avgConfidence * 360}deg)` 
              }}
            >
              <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(stats.avgConfidence * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* Mini breakdown */}
          <div className="grid grid-cols-3 gap-1 text-center text-xs">
            <div className="p-1.5 rounded bg-green-500/10">
              <div className="font-bold text-green-600">{stats.high}</div>
              <div className="text-muted-foreground">High</div>
            </div>
            <div className="p-1.5 rounded bg-amber-500/10">
              <div className="font-bold text-amber-600">{stats.medium}</div>
              <div className="text-muted-foreground">Medium</div>
            </div>
            <div className="p-1.5 rounded bg-red-500/10">
              <div className="font-bold text-red-600">{stats.low}</div>
              <div className="text-muted-foreground">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Confidence Analysis
        </CardTitle>
        <CardDescription>
          Field-level extraction confidence breakdown and quality metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Fields</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.high}</div>
            <div className="text-xs text-muted-foreground">High Conf.</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.medium}</div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats.low}</div>
            <div className="text-xs text-muted-foreground">Needs Review</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Overall Score Radial */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getConfidenceColor(stats.avgConfidence)}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.avgConfidence * 251.2} 251.2`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">
                      {Math.round(stats.avgConfidence * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">Average</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 mt-2">
                {distributionData.map(d => (
                  <Badge 
                    key={d.name} 
                    variant="outline" 
                    className="text-[9px]"
                    style={{ borderColor: d.color, color: d.color }}
                  >
                    {d.name.split(' ')[0]}: {d.value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Indicators */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quality Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Accuracy</span>
                </div>
                <Badge variant={stats.avgConfidence >= 0.8 ? 'default' : 'secondary'}>
                  {stats.avgConfidence >= 0.9 ? 'Excellent' : stats.avgConfidence >= 0.7 ? 'Good' : 'Review Needed'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Extraction Quality</span>
                  <span>{Math.round(stats.avgConfidence * 100)}%</span>
                </div>
                <Progress 
                  value={stats.avgConfidence * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Verification Progress</span>
                  <span>{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%</span>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.verified / stats.total) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field-by-Field Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Field Confidence Breakdown</CardTitle>
            <CardDescription>Top 10 extracted fields by confidence score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Confidence']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar 
                    dataKey="confidence" 
                    radius={[0, 4, 4, 0]}
                    fill="hsl(var(--primary))"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Confidence Fields Alert */}
        {stats.low > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Fields Requiring Review ({stats.low})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {fieldsData
                  .filter(f => f.confidence < 0.7)
                  .map(f => (
                    <Badge 
                      key={f.rawName} 
                      variant="outline" 
                      className="text-xs border-amber-500/50 text-amber-700"
                    >
                      {f.fieldName}: {Math.round(f.confidence * 100)}%
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfidenceVisualization;
