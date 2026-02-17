import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompetitiveIntelligence } from '@/hooks/useCompetitiveIntelligence';
import { COMPETITOR_CATEGORIES } from '@/services/competitiveIntelligenceService';
import {
  Target, TrendingUp, Shield, Zap, Brain, Globe, BarChart3,
  AlertTriangle, CheckCircle, ExternalLink, Loader2, Search, MapPin
} from 'lucide-react';

// ============================================================================
// REGION HIERARCHY (mirrors platform's 15 parent → 62+ sub-regions)
// ============================================================================

const REGION_HIERARCHY: Record<string, { label: string; subRegions: { id: string; label: string }[] }> = {
  global: { label: '🌍 Global', subRegions: [] },
  north_america: { label: '🇺🇸 North America', subRegions: [
    { id: 'us', label: 'United States' }, { id: 'canada', label: 'Canada' }, { id: 'mexico', label: 'Mexico' },
  ]},
  europe: { label: '🇪🇺 Europe', subRegions: [
    { id: 'uk', label: 'UK' }, { id: 'germany', label: 'Germany' }, { id: 'france', label: 'France' },
    { id: 'spain', label: 'Spain' }, { id: 'italy', label: 'Italy' }, { id: 'nordics', label: 'Nordics' },
    { id: 'benelux', label: 'Benelux' }, { id: 'eastern_europe', label: 'Eastern Europe' },
  ]},
  mena: { label: '🕌 MENA', subRegions: [
    { id: 'uae', label: 'UAE' }, { id: 'saudi', label: 'Saudi Arabia' }, { id: 'egypt', label: 'Egypt' },
    { id: 'qatar', label: 'Qatar' }, { id: 'kuwait', label: 'Kuwait' }, { id: 'morocco', label: 'Morocco' },
  ]},
  india: { label: '🇮🇳 India', subRegions: [
    { id: 'north_india', label: 'North India' }, { id: 'south_india', label: 'South India' },
    { id: 'east_india', label: 'East India' }, { id: 'west_india', label: 'West India' },
    { id: 'pan_india', label: 'Pan-India' },
  ]},
  sea: { label: '🌏 Southeast Asia', subRegions: [
    { id: 'singapore', label: 'Singapore' }, { id: 'malaysia', label: 'Malaysia' },
    { id: 'indonesia', label: 'Indonesia' }, { id: 'thailand', label: 'Thailand' },
    { id: 'philippines', label: 'Philippines' }, { id: 'vietnam', label: 'Vietnam' },
  ]},
  cjk: { label: '🇯🇵 CJK', subRegions: [
    { id: 'japan', label: 'Japan' }, { id: 'korea', label: 'Korea' },
    { id: 'china', label: 'China' }, { id: 'hong_kong', label: 'Hong Kong' }, { id: 'taiwan', label: 'Taiwan' },
  ]},
  latam: { label: '🌎 LATAM', subRegions: [
    { id: 'brazil', label: 'Brazil' }, { id: 'argentina', label: 'Argentina' },
    { id: 'colombia', label: 'Colombia' }, { id: 'chile', label: 'Chile' },
  ]},
  africa: { label: '🌍 Africa', subRegions: [
    { id: 'south_africa', label: 'South Africa' }, { id: 'nigeria', label: 'Nigeria' },
    { id: 'kenya', label: 'Kenya' }, { id: 'ghana', label: 'Ghana' },
  ]},
  oceania: { label: '🇦🇺 Oceania', subRegions: [
    { id: 'australia', label: 'Australia' }, { id: 'new_zealand', label: 'New Zealand' },
  ]},
  central_asia: { label: '🏔️ Central Asia', subRegions: [
    { id: 'turkey', label: 'Turkey' }, { id: 'pakistan', label: 'Pakistan' },
    { id: 'bangladesh', label: 'Bangladesh' }, { id: 'kazakhstan', label: 'Kazakhstan' },
  ]},
};

const ANALYSIS_TYPES = [
  { id: 'positioning', label: 'Positioning Strategy', icon: Target },
  { id: 'gap_analysis', label: 'Gap Analysis', icon: Search },
  { id: 'battle_card', label: 'Battle Cards', icon: Shield },
  { id: 'usp_summary', label: 'USP Narrative', icon: Zap },
  { id: 'swot', label: 'SWOT Analysis', icon: BarChart3 },
  { id: 'trend_report', label: 'Trend Report', icon: TrendingUp },
];

export const MarketIntelligenceDashboard: React.FC = () => {
  const { competitors, featureMatrix, usps, trends, analyses, stats, isLoading, runAnalysis } = useCompetitiveIntelligence();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);

  const filteredCompetitors = selectedCategory
    ? competitors.filter(c => c.category === selectedCategory)
    : competitors;

  const differentiators = featureMatrix.filter(f => f.is_differentiator);
  const currentRegionData = REGION_HIERARCHY[selectedRegion];

  const handleRunAnalysis = (typeId: string) => {
    runAnalysis.mutate({
      type: typeId,
      scope: selectedRegion,
      filter: selectedSubRegion || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <Card className="border-border">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Analysis Scope:</span>
            </div>
            <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setSelectedSubRegion(null); }}>
              <SelectTrigger className="w-[200px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REGION_HIERARCHY).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentRegionData?.subRegions.length > 0 && (
              <Select value={selectedSubRegion || 'all'} onValueChange={(v) => setSelectedSubRegion(v === 'all' ? null : v)}>
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Regions</SelectItem>
                  {currentRegionData.subRegions.map(sr => (
                    <SelectItem key={sr.id} value={sr.id}>{sr.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant="outline" className="text-[10px]">
              {selectedRegion === 'global' ? 'Global Analysis' : `${currentRegionData?.label}${selectedSubRegion ? ` → ${currentRegionData?.subRegions.find(s => s.id === selectedSubRegion)?.label}` : ''}`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Globe className="h-4 w-4" />} label="Competitors Tracked" value={stats?.totalCompetitors || 0} />
        <StatCard icon={<Shield className="h-4 w-4" />} label="Differentiators" value={stats?.differentiatorCount || 0} accent />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Validated USPs" value={`${stats?.validatedUSPs || 0}/${stats?.totalUSPs || 0}`} />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Unaddressed Trends" value={stats?.unaddressedTrends || 0} warn={(stats?.unaddressedTrends || 0) > 0} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Competitors</TabsTrigger>
          <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
          <TabsTrigger value="usps">USPs</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* ── Competitors Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All ({competitors.length})
            </Badge>
            {COMPETITOR_CATEGORIES.map(cat => {
              const count = competitors.filter(c => c.category === cat.id).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.label} ({count})
                </Badge>
              );
            })}
          </div>

          <ScrollArea className="h-[500px]">
            <div className="grid gap-3">
              {filteredCompetitors.map(comp => (
                <Card key={comp.id} className="border-border">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{comp.name}</h4>
                          <Badge variant="outline" className="text-[10px]">{comp.category}</Badge>
                          {comp.pricing_range && (
                            <Badge variant="secondary" className="text-[10px]">{comp.pricing_range}</Badge>
                          )}
                          {comp.website_url && (
                            <a href={comp.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {comp.key_features.slice(0, 4).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px] py-0">{f}</Badge>
                          ))}
                        </div>
                        {comp.weaknesses.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comp.weaknesses.slice(0, 3).map((w, i) => (
                              <Badge key={i} variant="destructive" className="text-[9px] py-0 opacity-70">{w}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Feature Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{differentiators.length} unique differentiators</span>
            <span className="text-xs text-muted-foreground">({featureMatrix.length} total features tracked)</span>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {featureMatrix.map(feat => (
                <Card key={feat.id} className={feat.is_differentiator ? 'border-primary/30 bg-primary/5' : 'border-border'}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {feat.is_differentiator && <Zap className="h-3 w-3 text-primary" />}
                          <span className="text-sm font-medium">{feat.feature_name}</span>
                          <Badge variant="outline" className="text-[9px]">{feat.feature_category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{feat.genie_details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-[9px]" variant={feat.genie_capability === 'unique' ? 'default' : 'secondary'}>
                            {feat.genie_capability}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{feat.genie_product}</span>
                          <div className="flex gap-1 ml-auto">
                            {Object.entries(feat.competitor_scores || {}).slice(0, 4).map(([name, score]) => (
                              <Badge key={name} variant="outline" className={`text-[8px] py-0 ${score === 'none' ? 'text-destructive' : score === 'partial' ? 'text-muted-foreground' : 'text-primary'}`}>
                                {name}: {score as string}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-lg font-bold text-primary">{Math.round(feat.importance_weight * 100)}%</div>
                        <div className="text-[9px] text-muted-foreground">weight</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── USPs Tab */}
        <TabsContent value="usps" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {usps.map(usp => (
                <Card key={usp.id} className="border-border">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {usp.is_validated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{usp.usp_statement}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{usp.product_id}</Badge>
                          {usp.market_segment && (
                            <Badge variant="secondary" className="text-[9px]">{usp.market_segment}</Badge>
                          )}
                          <span className="text-[10px] text-primary font-medium ml-auto">
                            {Math.round(usp.strength_score * 100)}% strength
                          </span>
                        </div>
                        {usp.competitors_lacking.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-[9px] text-muted-foreground">Competitors lacking:</span>
                            {usp.competitors_lacking.map((c, i) => (
                              <Badge key={i} variant="destructive" className="text-[8px] py-0 opacity-70">{c}</Badge>
                            ))}
                          </div>
                        )}
                        {usp.supporting_evidence.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[9px] text-muted-foreground">Evidence:</span>
                            <ul className="list-disc list-inside text-[10px] text-muted-foreground">
                              {usp.supporting_evidence.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ANALYSIS_TYPES.map(type => (
              <Button
                key={type.id}
                size="sm"
                variant="outline"
                onClick={() => handleRunAnalysis(type.id)}
                disabled={runAnalysis.isPending}
                className="text-xs"
              >
                {runAnalysis.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <type.icon className="h-3 w-3 mr-1" />}
                {type.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {analyses.map(analysis => (
                <Card key={analysis.id} className="border-border">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{analysis.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{analysis.analysis_type}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{analysis.model_used}</Badge>
                        {analysis.scope && analysis.scope !== 'global' && (
                          <Badge variant="default" className="text-[9px]">
                            <MapPin className="h-2 w-2 mr-0.5" />
                            {analysis.scope}{analysis.scope_filter ? ` → ${analysis.scope_filter}` : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <p className="text-xs text-muted-foreground">{analysis.summary}</p>
                    {analysis.key_insights.length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] font-medium">Key Insights:</span>
                        <ul className="list-disc list-inside text-[10px] text-muted-foreground mt-1 space-y-0.5">
                          {analysis.key_insights.slice(0, 5).map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.recommendations.length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] font-medium text-primary">Recommendations:</span>
                        <ul className="list-disc list-inside text-[10px] text-muted-foreground mt-1 space-y-0.5">
                          {analysis.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                      <span>Confidence: {Math.round(analysis.confidence_score * 100)}%</span>
                      <span>•</span>
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {analyses.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No analyses yet. Select a region and click a button above to generate AI market analysis.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {trends.map(trend => (
                <Card key={trend.id} className={`border-border ${!trend.is_addressed ? 'border-l-2 border-l-yellow-500' : ''}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{trend.title}</span>
                          <Badge variant={trend.impact_level === 'critical' ? 'destructive' : trend.impact_level === 'high' ? 'default' : 'secondary'} className="text-[9px]">
                            {trend.impact_level}
                          </Badge>
                          <Badge variant="outline" className="text-[9px]">{trend.trend_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {trends.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No trends tracked yet. Trends will be captured via AI analysis and monitoring.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ── Stat Card
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
  warn?: boolean;
}> = ({ icon, label, value, accent, warn }) => (
  <Card className={`border-border ${accent ? 'bg-primary/5 border-primary/20' : ''} ${warn ? 'border-yellow-500/30' : ''}`}>
    <CardContent className="py-3 px-4">
      <div className="flex items-center gap-2">
        <div className={accent ? 'text-primary' : warn ? 'text-yellow-500' : 'text-muted-foreground'}>{icon}</div>
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);
