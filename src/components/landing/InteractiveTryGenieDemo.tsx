/**
 * INTERACTIVE TRY GENIE DEMO — Landing Page Section
 * 
 * Uses dynamic language registry instead of hardcoded data.
 * Allows visitors to try:
 * 1. TTS: Type text → hear it in any language (Azure Neural)
 * 2. Industry Use Cases: Pre-built showcases with audio demos
 * 3. Transcreation comparison: Same text → different cultural adaptations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, Mic, Globe, Sparkles, Play, Languages, 
  Loader2, Building2, GraduationCap, Heart, ShoppingBag,
  Megaphone, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTTSDemo } from '@/hooks/landing/useTTSDemo';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';

// ============================================
// INDUSTRY USE CASES (driven by icons, could be DB-driven later)
// ============================================
const INDUSTRY_USE_CASES = [
  {
    icon: Heart,
    name: 'Healthcare',
    description: 'Patient education videos in 7 Arabic dialects + 11 Indian languages',
    example: 'Patient onboarding video in Saudi Arabic: "كيف تحجز موعدك بسهولة"',
    languages: ['ar-SA', 'hi-IN', 'ta-IN', 'sw-KE'],
    color: 'text-red-500',
  },
  {
    icon: GraduationCap,
    name: 'Education',
    description: 'E-learning courses with code-mixed narration for Indian markets',
    example: 'Course intro in Hindi: "AI course creator फ्री में ट्राई करो!"',
    languages: ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN'],
    color: 'text-blue-500',
  },
  {
    icon: ShoppingBag,
    name: 'E-Commerce',
    description: 'Product demos transcreated for LATAM — Mexican ≠ Argentine ≠ Chilean',
    example: 'Product launch in Mexican Spanish: "¡Échale ganas — es gratis, neta!"',
    languages: ['es-MX', 'es-CO', 'pt-BR', 'es-AR'],
    color: 'text-amber-500',
  },
  {
    icon: Landmark,
    name: 'Government',
    description: 'Public service announcements in MSA + regional dialects',
    example: 'Government PSA in Gulf Arabic: "الخدمات الحكومية الرقمية"',
    languages: ['ar-SA', 'ar-AE', 'ar-EG', 'ar-MSA'],
    color: 'text-emerald-500',
  },
  {
    icon: Building2,
    name: 'Real Estate',
    description: 'Property tours for MENA luxury market with Gulf dialect narration',
    example: 'Villa tour in Gulf Arabic: "شقق فاخرة في دبي — مع عوائد مضمونة"',
    languages: ['ar-AE', 'ar-SA', 'zh-CN', 'ko-KR'],
    color: 'text-purple-500',
  },
  {
    icon: Megaphone,
    name: 'Marketing',
    description: 'Campaign videos for Africa — Swahili, Yoruba, Hausa, Zulu',
    example: 'Ad in Swahili: "Anza kuunda video za kushangaza — bure kabisa!"',
    languages: ['sw-KE', 'yo-NG', 'ha-NG', 'zu-ZA'],
    color: 'text-pink-500',
  },
];

// ============================================
// COMPONENT
// ============================================
interface InteractiveTryGenieDemoProps {
  className?: string;
  region?: string;
}

export const InteractiveTryGenieDemo: React.FC<InteractiveTryGenieDemoProps> = ({
  className = '',
  region,
}) => {
  const registry = useDynamicLanguageRegistry();
  const tts = useTTSDemo();
  
  // Get region-sorted languages from registry
  const sortedLanguages = region 
    ? registry.getLanguagesForRegion(region)
    : registry.ttsLanguages;
  
  const coreLanguages = region ? registry.getCoreLanguages(region) : [];
  const coreCodes = coreLanguages.map(l => l.code);
  
  const defaultLang = coreCodes[0] || sortedLanguages[0]?.code || 'ar-SA';
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [customText, setCustomText] = useState('');
  const [activeUseCase, setActiveUseCase] = useState<number | null>(null);

  const handlePlayCustom = () => {
    if (!customText.trim()) return;
    tts.playCustomText(customText.trim(), selectedLang);
  };

  const handlePlayUseCase = (index: number, langCode: string) => {
    setActiveUseCase(index);
    tts.playTranscreation(langCode);
  };

  // Only show languages that have TTS support
  const ttsLangs = sortedLanguages.filter(l => l.transcreation);

  return (
    <section className={`py-20 relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">Try It Live</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hear the Difference. Experience Transcreation.
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Type any text, select a language, and hear it spoken by Azure Neural TTS — 
            with proper regional pronunciation and cultural tone.
          </p>
        </motion.div>

        {/* ============ TTS TRY-IT PANEL ============ */}
        <motion.div
          className="max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Volume2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Text-to-Speech Demo</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    Type your text, pick a language, and hear it instantly
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Language selector — dynamic from registry */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedLang} onValueChange={setSelectedLang}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {ttsLangs.map(lang => {
                      const isCore = coreCodes.includes(lang.code);
                      return (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name} {isCore ? '⭐' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="flex items-center gap-1 self-center px-3 py-2">
                  <Globe className="h-3 w-3" />
                  Azure Neural TTS
                </Badge>
              </div>

              {/* Text input */}
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type any text here — e.g., 'Welcome to our platform! Create amazing AI videos in seconds.'"
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{customText.length}/500 characters</span>
                <Button
                  onClick={handlePlayCustom}
                  disabled={!customText.trim() || tts.isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {tts.isLoading && tts.currentCode === selectedLang ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  {tts.isPlaying && tts.currentCode === selectedLang ? 'Playing...' : 'Speak It'}
                </Button>
              </div>

              {/* Playback indicator */}
              {tts.isPlaying && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5,6].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{ height: [4, 16, 8, 20, 6, 14] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-primary font-medium">
                    🎙️ Playing via {tts.provider || 'Azure Neural'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={tts.stopAudio} className="h-7 px-2">
                    Stop
                  </Button>
                </div>
              )}

              {tts.error && (
                <p className="text-sm text-destructive text-center">{tts.error}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ============ INDUSTRY USE CASES ============ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-foreground mb-3">
              Built for Every Industry
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click any use case to hear the transcreated audio sample — 
              same message, culturally adapted for each market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRY_USE_CASES.map((useCase, i) => {
              const Icon = useCase.icon;
              const isActive = activeUseCase === i && tts.isPlaying;
              
              return (
                <motion.div
                  key={useCase.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`h-full transition-all cursor-pointer hover:shadow-lg ${
                    isActive ? 'border-primary shadow-lg ring-1 ring-primary/30' : 'border-border hover:border-primary/30'
                  }`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${useCase.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{useCase.name}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      
                      {/* Example with play */}
                      <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Example:</p>
                        <p className="text-sm text-foreground italic">{useCase.example}</p>
                      </div>

                      {/* Language play buttons — resolve names from registry */}
                      <div className="flex flex-wrap gap-2">
                        {useCase.languages.map(langCode => {
                          const lang = registry.ttsLanguages.find(l => l.code === langCode);
                          const isPlayingThis = tts.currentCode === langCode && tts.isPlaying;
                          const isLoadingThis = tts.currentCode === langCode && tts.isLoading;
                          
                          return (
                            <Button
                              key={langCode}
                              size="sm"
                              variant={isPlayingThis ? 'default' : 'outline'}
                              className="h-7 text-xs gap-1"
                              onClick={() => handlePlayUseCase(i, langCode)}
                              disabled={tts.isLoading && !isLoadingThis}
                            >
                              {isLoadingThis ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Volume2 className="h-3 w-3" />
                              )}
                              {lang?.flag || '🌐'} {langCode.split('-')[0]}
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ============ BOTTOM CTA ============ */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-4">
            This is just a preview. The full platform generates complete videos, presentations, 
            and marketing campaigns — all transcreated for your market.
          </p>
          <div className="flex justify-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Languages className="h-3 w-3 mr-1" /> {registry.ttsLanguages.length || '70'}+ Languages
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Mic className="h-3 w-3 mr-1" /> STT Available
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Play className="h-3 w-3 mr-1" /> Video Generation
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveTryGenieDemo;
