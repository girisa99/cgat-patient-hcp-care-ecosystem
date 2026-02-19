/**
 * URL Content Analyzer - Smart Detection with User Confirmation
 * Analyzes URL to detect content type and offers appropriate script options
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link, 
  ShoppingBag, 
  Globe, 
  GraduationCap,
  Mic,
  Film,
  FileText,
  Newspaper,
  BookOpen,
  Package,
  Building2,
  HelpCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Layers,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type DetectedURLContentType = 
  | 'product_page'
  | 'documentation'
  | 'blog_article'
  | 'landing_page'
  | 'news_article'
  | 'ecommerce'
  | 'portfolio'
  | 'company_about'
  | 'tutorial'
  | 'faq_support'
  | 'general';

export interface URLAnalysisResult {
  detectedType: DetectedURLContentType;
  confidence: number;
  alternativeTypes: { type: DetectedURLContentType; confidence: number }[];
  pageTitle: string;
  pageDescription: string;
  hasImages: boolean;
  hasVideo: boolean;
  hasPricing: boolean;
  hasTestimonials: boolean;
  keyTopics: string[];
  suggestedScriptFormats: string[];
  wordCount: number;
}

interface ScriptFormatOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  availableFor: DetectedURLContentType[];
}

const CONTENT_TYPE_INFO: Record<DetectedURLContentType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  product_page: {
    label: 'Product Page',
    description: 'Product features, specs, and benefits',
    icon: <Package className="h-5 w-5" />,
    color: 'text-purple-500',
  },
  documentation: {
    label: 'Documentation',
    description: 'Technical docs, API guides, manuals',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-blue-500',
  },
  blog_article: {
    label: 'Blog / Article',
    description: 'Blog post, thought leadership content',
    icon: <Newspaper className="h-5 w-5" />,
    color: 'text-green-500',
  },
  landing_page: {
    label: 'Landing Page',
    description: 'Marketing page, campaign landing',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-amber-500',
  },
  news_article: {
    label: 'News Article',
    description: 'News, press release, current events',
    icon: <Newspaper className="h-5 w-5" />,
    color: 'text-red-500',
  },
  ecommerce: {
    label: 'E-commerce',
    description: 'Online store, product catalog',
    icon: <ShoppingBag className="h-5 w-5" />,
    color: 'text-pink-500',
  },
  portfolio: {
    label: 'Portfolio / Showcase',
    description: 'Work samples, case studies',
    icon: <Layers className="h-5 w-5" />,
    color: 'text-indigo-500',
  },
  company_about: {
    label: 'Company / About',
    description: 'Company info, team, mission',
    icon: <Building2 className="h-5 w-5" />,
    color: 'text-cyan-500',
  },
  tutorial: {
    label: 'Tutorial / Guide',
    description: 'How-to content, step-by-step guides',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'text-orange-500',
  },
  faq_support: {
    label: 'FAQ / Support',
    description: 'Help articles, FAQs, support content',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'text-teal-500',
  },
  general: {
    label: 'General Web Page',
    description: 'Mixed or unclassified content',
    icon: <Globe className="h-5 w-5" />,
    color: 'text-gray-500',
  },
};

const SCRIPT_FORMAT_OPTIONS: ScriptFormatOption[] = [
  {
    id: 'video_script',
    label: 'Video Script',
    description: 'Full narration script for video production',
    icon: <Film className="h-4 w-4" />,
    availableFor: ['product_page', 'documentation', 'blog_article', 'landing_page', 'news_article', 'ecommerce', 'portfolio', 'company_about', 'tutorial', 'faq_support', 'general'],
  },
  {
    id: 'marketing_script',
    label: 'Marketing Script',
    description: 'Promotional script with key selling points',
    icon: <Sparkles className="h-4 w-4" />,
    availableFor: ['product_page', 'landing_page', 'ecommerce', 'company_about'],
  },
  {
    id: 'tutorial_script',
    label: 'Tutorial Script',
    description: 'Step-by-step instructional format',
    icon: <GraduationCap className="h-4 w-4" />,
    availableFor: ['documentation', 'tutorial', 'faq_support', 'blog_article'],
  },
  {
    id: 'podcast_script',
    label: 'Podcast Script',
    description: 'Conversational format for audio content',
    icon: <Mic className="h-4 w-4" />,
    availableFor: ['blog_article', 'news_article', 'company_about', 'tutorial', 'general'],
  },
  {
    id: 'presentation_script',
    label: 'Presentation Script',
    description: 'Slide-by-slide presentation narration',
    icon: <Layers className="h-4 w-4" />,
    availableFor: ['product_page', 'documentation', 'landing_page', 'portfolio', 'company_about', 'tutorial'],
  },
  {
    id: 'summary_script',
    label: 'Summary / Recap',
    description: 'Concise overview of key points',
    icon: <FileText className="h-4 w-4" />,
    availableFor: ['documentation', 'blog_article', 'news_article', 'faq_support', 'general'],
  },
];

interface URLContentAnalyzerProps {
  url: string;
  onAnalysisComplete: (result: URLAnalysisResult, selectedFormat: string, options: URLScriptOptions) => void;
  onCancel: () => void;
  className?: string;
}

export interface URLScriptOptions {
  includeSections: boolean;
  includeCallToAction: boolean;
  enhanceWithAI: boolean;
  addVisualCues: boolean;
  generateTTS: boolean;
  extractKeyPoints: boolean;
}

export function URLContentAnalyzer({
  url,
  onAnalysisComplete,
  onCancel,
  className,
}: URLContentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<URLAnalysisResult | null>(null);
  const [confirmedType, setConfirmedType] = useState<DetectedURLContentType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('video_script');
  const [options, setOptions] = useState<URLScriptOptions>({
    includeSections: true,
    includeCallToAction: true,
    enhanceWithAI: true,
    addVisualCues: true,
    generateTTS: false,
    extractKeyPoints: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Analyze URL on mount
  useEffect(() => {
    analyzeURL();
  }, [url]);

  const analyzeURL = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Simulate progress while analyzing
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 400);

      // Call AI to analyze the URL content
      const { data, error: aiError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: `Analyze this URL and determine what type of web content it is: ${url}

Based on the URL structure and any available context, classify this page into ONE of these categories:
- product_page: Product features, specifications, and benefits page
- documentation: Technical documentation, API guides, manuals
- blog_article: Blog post, thought leadership, editorial content
- landing_page: Marketing landing page, campaign page
- news_article: News, press release, current events
- ecommerce: Online store, product catalog, shopping page
- portfolio: Work samples, case studies, creative showcase
- company_about: Company info, team page, mission/values
- tutorial: How-to content, step-by-step instructional guides
- faq_support: Help articles, FAQs, support documentation
- general: Mixed or unclassified web content

Also predict:
- pageTitle: Likely page title
- pageDescription: Likely meta description
- hasImages: Would this page likely have product/feature images?
- hasVideo: Would this page likely have embedded videos?
- hasPricing: Would this page likely have pricing information?
- hasTestimonials: Would this page likely have testimonials/reviews?
- keyTopics: What are 3-5 likely key topics?
- wordCount: Estimated word count (300-3000)

Return ONLY valid JSON:
{
  "detectedType": "product_page",
  "confidence": 0.85,
  "alternativeTypes": [
    {"type": "landing_page", "confidence": 0.60},
    {"type": "ecommerce", "confidence": 0.45}
  ],
  "pageTitle": "Example Product - Features & Benefits",
  "pageDescription": "Discover the amazing features...",
  "hasImages": true,
  "hasVideo": false,
  "hasPricing": true,
  "hasTestimonials": true,
  "keyTopics": ["topic1", "topic2"],
  "suggestedScriptFormats": ["video_script", "marketing_script"],
  "wordCount": 1200
}`,
          systemPrompt: 'You are a web content classifier. Analyze URLs to determine page type and content characteristics. Return valid JSON only.',
          action: 'analyze_url',
        },
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (aiError) throw new Error(aiError.message);

      // Parse the AI response
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse analysis result');
      }

      const result = JSON.parse(jsonMatch[0]) as URLAnalysisResult;
      
      setAnalysisResult(result);
      setConfirmedType(result.detectedType);
      
      // Auto-select best format based on detection
      if (result.suggestedScriptFormats?.length > 0) {
        setSelectedFormat(result.suggestedScriptFormats[0]);
      }
      
      // Auto-adjust options based on content type
      if (result.detectedType === 'product_page' || result.detectedType === 'landing_page') {
        setOptions(prev => ({ ...prev, includeCallToAction: true }));
      }
      if (result.detectedType === 'documentation' || result.detectedType === 'tutorial') {
        setOptions(prev => ({ ...prev, includeSections: true, extractKeyPoints: true }));
      }
    } catch (err) {
      console.error('URL analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      // Fallback to general type
      setAnalysisResult({
        detectedType: 'general',
        confidence: 0.5,
        alternativeTypes: [],
        pageTitle: 'Web Page',
        pageDescription: '',
        hasImages: true,
        hasVideo: false,
        hasPricing: false,
        hasTestimonials: false,
        keyTopics: [],
        suggestedScriptFormats: ['video_script'],
        wordCount: 500,
      });
      setConfirmedType('general');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (!analysisResult || !confirmedType) return;
    
    const updatedResult = {
      ...analysisResult,
      detectedType: confirmedType,
    };
    
    onAnalysisComplete(updatedResult, selectedFormat, options);
  };

  const availableFormats = SCRIPT_FORMAT_OPTIONS.filter(
    format => confirmedType && format.availableFor.includes(confirmedType)
  );

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Smart URL Analysis</CardTitle>
            <CardDescription>
              {isAnalyzing ? 'Analyzing page content...' : 'Confirm detected content type and script options'}
            </CardDescription>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open URL
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* URL Preview */}
        <div className="p-3 rounded-lg bg-secondary/50 border">
          <p className="text-sm font-mono text-muted-foreground truncate">{url}</p>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Detecting page content type...</span>
              <span>{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button variant="ghost" size="sm" onClick={analyzeURL} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {!isAnalyzing && analysisResult && (
          <>
            {/* Page Preview Info */}
            {analysisResult.pageTitle && (
              <div className="p-3 rounded-lg border bg-card">
                <h4 className="font-medium text-sm">{analysisResult.pageTitle}</h4>
                {analysisResult.pageDescription && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {analysisResult.pageDescription}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysisResult.keyTopics.slice(0, 4).map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {analysisResult.wordCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      ~{analysisResult.wordCount} words
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Detected Type Confirmation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Detected Content Type</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(CONTENT_TYPE_INFO).slice(0, 8).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setConfirmedType(type as DetectedURLContentType)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      confirmedType === type
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50",
                      type === analysisResult.detectedType && confirmedType !== type
                        ? "border-primary/30"
                        : ""
                    )}
                  >
                    <div className={cn("mb-1", info.color)}>{info.icon}</div>
                    <p className="text-xs font-medium truncate">{info.label}</p>
                    {type === analysisResult.detectedType && (
                      <Badge variant="secondary" className="text-[9px] mt-1">
                        {Math.round(analysisResult.confidence * 100)}% match
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Show more types */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CONTENT_TYPE_INFO).slice(8).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setConfirmedType(type as DetectedURLContentType)}
                    className={cn(
                      "p-2 rounded-lg border text-left transition-all flex items-center gap-2",
                      confirmedType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(info.color)}>{info.icon}</div>
                    <span className="text-xs font-medium">{info.label}</span>
                  </button>
                ))}
              </div>

              {/* Detection Details */}
              <div className="flex flex-wrap gap-2 text-xs">
                {analysisResult.hasImages && (
                  <Badge variant="outline" className="gap-1">
                    Has Images
                  </Badge>
                )}
                {analysisResult.hasVideo && (
                  <Badge variant="outline" className="gap-1">
                    Has Video
                  </Badge>
                )}
                {analysisResult.hasPricing && (
                  <Badge variant="outline" className="gap-1">
                    Has Pricing
                  </Badge>
                )}
                {analysisResult.hasTestimonials && (
                  <Badge variant="outline" className="gap-1">
                    Has Testimonials
                  </Badge>
                )}
              </div>
            </div>

            {/* Script Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Script Format</Label>
              <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
                <div className="grid gap-2">
                  {availableFormats.map((format) => (
                    <div
                      key={format.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedFormat === format.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <RadioGroupItem value={format.id} id={format.id} />
                      <div className="p-2 rounded-md bg-secondary">
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={format.id} className="font-medium cursor-pointer">
                          {format.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Processing Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Processing Options</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeSections" 
                    checked={options.includeSections}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeSections: !!checked }))
                    }
                  />
                  <Label htmlFor="includeSections" className="text-sm cursor-pointer">
                    Include Section Breaks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCallToAction" 
                    checked={options.includeCallToAction}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCallToAction: !!checked }))
                    }
                  />
                  <Label htmlFor="includeCallToAction" className="text-sm cursor-pointer">
                    Add Call-to-Action
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enhanceWithAI" 
                    checked={options.enhanceWithAI}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, enhanceWithAI: !!checked }))
                    }
                  />
                  <Label htmlFor="enhanceWithAI" className="text-sm cursor-pointer">
                    AI Enhancement
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="addVisualCues" 
                    checked={options.addVisualCues}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, addVisualCues: !!checked }))
                    }
                  />
                  <Label htmlFor="addVisualCues" className="text-sm cursor-pointer">
                    Add Visual Cues
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="extractKeyPoints" 
                    checked={options.extractKeyPoints}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, extractKeyPoints: !!checked }))
                    }
                  />
                  <Label htmlFor="extractKeyPoints" className="text-sm cursor-pointer">
                    Extract Key Points
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="generateTTS" 
                    checked={options.generateTTS}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, generateTTS: !!checked }))
                    }
                  />
                  <Label htmlFor="generateTTS" className="text-sm cursor-pointer">
                    Generate TTS Audio
                  </Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1 gap-2">
                Generate Script
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
