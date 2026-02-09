/**
 * Content Demo Card — Generate AI marketing content per industry
 * 
 * Calls ai-universal-processor with rate limiting.
 * Shows real AI-generated marketing copy (blogs, social, emails, ads) with watermark.
 * Demonstrates the content transcreation pipeline.
 */

import React, { useState } from 'react';
import { FileText, Loader2, Sparkles, Globe, Lock, ChevronRight, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { getIndustryExample } from './industryDemoExamples';

interface ContentDemoCardProps {
  industryId: string;
  region?: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

const CONTENT_TYPE_ICONS: Record<string, string> = {
  blog: '📝',
  social: '📱',
  email: '✉️',
  ad: '📢',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  blog: 'Blog Post',
  social: 'Social Media Post',
  email: 'Email Campaign',
  ad: 'Ad Copy',
};

interface GeneratedContent {
  headline: string;
  body: string;
  cta: string;
  hashtags?: string[];
  subjectLine?: string;
}

export const ContentDemoCard: React.FC<ContentDemoCardProps> = ({ industryId, region }) => {
  const example = getIndustryExample(industryId);
  const contentExample = example?.pipelines.content;

  const [selectedLang, setSelectedLang] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!contentExample) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setContent(null);

    const langName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
    const contentType = contentExample.type;

    const prompt = `You are a professional marketing copywriter. Create a ${CONTENT_TYPE_LABELS[contentType]} for the ${example?.industryName} industry.

Brief: "${contentExample.prompt}"
Content Type: ${CONTENT_TYPE_LABELS[contentType]}
Tone: ${contentExample.tone}
Language: ${langName}

Provide:
- headline: A compelling headline/title
- body: The main content (150-250 words, well-formatted)
${contentType === 'email' ? '- subjectLine: Email subject line' : ''}
- cta: A strong call-to-action
${contentType === 'social' ? '- hashtags: 3-5 relevant hashtags' : ''}

${selectedLang !== 'en' ? `IMPORTANT: Generate ALL content in ${langName}. Transcreate culturally — don't just translate, adapt the messaging, idioms, and cultural references for ${langName}-speaking audiences.` : ''}

Respond in valid JSON format: { "headline": "...", "body": "...", "cta": "..."${contentType === 'email' ? ', "subjectLine": "..."' : ''}${contentType === 'social' ? ', "hashtags": ["..."]' : ''} }`;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt,
          systemPrompt: 'You are a professional marketing copywriter. Always respond with valid JSON only, no markdown code fences.',
          temperature: 0.8,
          maxTokens: 1500,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Generation failed');

      const responseText = data?.generatedText || data?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setContent(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error('Could not parse content data');
      }
    } catch (err: any) {
      const msg = err?.message || 'Generation failed';
      if (msg.includes('429') || msg.includes('rate') || msg.toLowerCase().includes('limit')) {
        setError('Demo limit reached — each visitor gets limited free tries per minute. Please wait a moment.');
      } else {
        setError(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedLangName = LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.name || 'English';
  const typeIcon = CONTENT_TYPE_ICONS[contentExample.type] || '📝';
  const typeLabel = CONTENT_TYPE_LABELS[contentExample.type] || 'Content';

  return (
    <Card className="border-green-500/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-primary/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">AI Content Writer</h3>
            <p className="text-sm text-muted-foreground font-normal">
              {contentExample.title} — {typeLabel}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <PenTool className="h-3 w-3" /> Genie Spark
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Brief preview */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
            {typeIcon} Brief
          </p>
          <p className="text-sm text-foreground">{contentExample.prompt}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-[10px]">🎨 Tone: {contentExample.tone}</Badge>
            <Badge variant="outline" className="text-[10px]">{typeIcon} {typeLabel}</Badge>
          </div>
        </div>

        {/* Language + generate */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1.5 block">
              Generate in Language
            </label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-5">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-600/90 text-white gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isGenerating ? 'Writing...' : 'Generate Content'}
            </Button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Brief</span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
            {selectedLang !== 'en' ? 'Transcreation' : 'AI Copywriting'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">{typeLabel}</span>
        </div>

        {/* Loading */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-3 py-6 bg-green-500/5 rounded-xl border border-green-500/20">
            <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Writing {typeLabel.toLowerCase()} in {selectedLangName}...
            </span>
          </div>
        )}

        {/* Generated content */}
        <AnimatePresence mode="wait">
          {content && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="relative bg-card rounded-xl border border-border p-6 overflow-hidden" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="rotate-[-25deg] opacity-10">
                    <p className="text-4xl font-black text-foreground tracking-widest">PREVIEW</p>
                    <p className="text-base font-bold text-foreground text-center">Genie Studio</p>
                  </div>
                </div>

                <div className="relative z-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      {typeIcon} {typeLabel}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Globe className="h-2.5 w-2.5" />
                      {selectedLangName}
                    </Badge>
                  </div>

                  {content.subjectLine && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Subject:</strong> {content.subjectLine}
                    </p>
                  )}

                  <h4 className="text-xl font-bold text-foreground">{content.headline}</h4>

                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {content.body}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-bold text-primary">{content.cta}</p>
                  </div>

                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-primary font-medium">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                <Lock className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  <strong className="text-foreground">Want full campaigns?</strong> Sign up to generate complete multi-channel campaigns with A/B variants in 140+ languages.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Sign up for unlimited access ✨</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentDemoCard;
