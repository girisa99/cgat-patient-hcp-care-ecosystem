/**
 * INTERACTIVE LANGUAGE DIALECT DEMO
 * 
 * True localization showcase for Arabic dialects, Indian languages, and African languages
 * Features: Audio playback, transcreation comparison, animated demonstrations
 */
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Play, Pause, Loader2, Check, X, Globe, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================
// TYPES & DATA
// ============================================

type LanguageTab = 'arabic' | 'indian' | 'african';

interface DialectItem {
  code: string;
  name: string;
  region: string;
  example: string;
  nativeName?: string;
}

const ARABIC_DIALECTS: DialectItem[] = [
  { code: 'ar-msa', name: 'MSA', region: 'Formal/News', example: 'ابدأ بإنشاء مقاطع فيديو رائعة', nativeName: 'العربية الفصحى' },
  { code: 'ar-SA', name: 'Saudi', region: 'Saudi Arabia', example: 'ابدأ تسوي فيديوهات روعة', nativeName: 'السعودية' },
  { code: 'ar-gulf', name: 'Gulf', region: 'UAE/Kuwait/Qatar', example: 'ابدا سوّي فيديوهات حلوة', nativeName: 'الخليجية' },
  { code: 'ar-EG', name: 'Egyptian', region: 'Egypt', example: 'ابدأ اعمل فيديوهات جامدة', nativeName: 'المصرية' },
  { code: 'ar-levantine', name: 'Levantine', region: 'Lebanon/Syria', example: 'بلّش اعمل فيديوهات كتير حلوة', nativeName: 'الشامية' },
  { code: 'ar-maghrebi', name: 'Maghrebi', region: 'Morocco/Algeria', example: 'بدا دير فيديوهات زوينين', nativeName: 'المغاربية' },
  { code: 'ar-IQ', name: 'Iraqi', region: 'Iraq', example: 'ابدي سوّي فيديوهات روعة', nativeName: 'العراقية' },
];

const INDIAN_LANGUAGES: DialectItem[] = [
  { code: 'hi', name: 'Hindi', region: 'North India', example: 'AI course creator free में try करो!', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', region: 'West Bengal', example: 'AI course creator free তে try করো!', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', region: 'Andhra/Telangana', example: 'AI course creator ఫ్రీగా ట్రై చేయండి!', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', region: 'Tamil Nadu', example: 'AI course creator free-ல try பண்ணுங்க!', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', region: 'Maharashtra', example: 'AI course creator free मध्ये try करा!', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', region: 'Gujarat', example: 'AI course creator free માં try કરો!', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', region: 'Karnataka', example: 'AI course creator free ಯಲ್ಲಿ try ಮಾಡಿ!', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', region: 'Kerala', example: 'AI course creator free ആയി try ചെയ്യൂ!', nativeName: 'മലയാളം' },
];

const AFRICAN_LANGUAGES: DialectItem[] = [
  { code: 'sw', name: 'Swahili', region: 'East Africa', example: 'Anza kuunda video nzuri leo!', nativeName: 'Kiswahili' },
  { code: 'yo', name: 'Yoruba', region: 'Nigeria', example: 'Bẹrẹ si da fidio lẹwa loni!', nativeName: 'Yorùbá' },
  { code: 'ha', name: 'Hausa', region: 'Nigeria/Niger', example: 'Fara ƙirƙirar bidiyo masu kyau yau!', nativeName: 'Hausa' },
  { code: 'zu', name: 'Zulu', region: 'South Africa', example: 'Qala ukwenza amavidiyo amahle namuhla!', nativeName: 'isiZulu' },
  { code: 'am', name: 'Amharic', region: 'Ethiopia', example: 'ዛሬ ድንቅ ቪዲዮዎችን መፍጠር ይጀምሩ!', nativeName: 'አማርኛ' },
  { code: 'af', name: 'Afrikaans', region: 'South Africa', example: 'Begin vandag pragtige videos skep!', nativeName: 'Afrikaans' },
  { code: 'xh', name: 'Xhosa', region: 'South Africa', example: 'Qala ukwenza iividiyo ezintle namhlanje!', nativeName: 'isiXhosa' },
  { code: 'ig', name: 'Igbo', region: 'Nigeria', example: 'Bido imeputa vidio mara mma taa!', nativeName: 'Igbo' },
  { code: 'rw', name: 'Kinyarwanda', region: 'Rwanda', example: 'Tangira gukora amavidewo meza uyu munsi!', nativeName: 'Ikinyarwanda' },
  { code: 'so', name: 'Somali', region: 'Somalia', example: 'Bilow samaynta muuqaallo qurux badan maanta!', nativeName: 'Soomaali' },
];

const LITERAL_VS_TRANSCREATION = {
  literal: {
    text: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं',
    label: 'Literal Translation',
    issue: '❌ Textbook style. Nobody talks like this.',
  },
  transcreation: {
    text: 'AI course creator free में try करो! एकदम मस्त है!',
    label: 'Genie Transcreation',
    benefit: '✅ Natural urban speech with English terms',
  },
};

// ============================================
// COMPONENT
// ============================================

interface LanguageDialectDemoProps {
  onExploreMore?: () => void;
}

export const LanguageDialectDemo: React.FC<LanguageDialectDemoProps> = ({ onExploreMore }) => {
  const [langTab, setLangTab] = useState<LanguageTab>('arabic');
  const [showTranscreation, setShowTranscreation] = useState(true);
  const [playingCode, setPlayingCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayDialect = async (code: string, mode?: 'literal' | 'transcreation') => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingCode === code) {
      setPlayingCode(null);
      return;
    }

    setLoadingCode(code);

    try {
      // Call the dialect-tts-demo edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialect-tts-demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate_tts',
            languageCode: code,
            mode: mode || 'transcreation',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS generation failed');
      }

      // Get audio blob and play
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingCode(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingCode(null);
        toast.error('Audio playback failed');
      };

      await audio.play();
      setPlayingCode(code);
      
      const provider = response.headers.get('X-TTS-Provider') || 'azure';
      console.log(`[LanguageDialectDemo] Playing ${code} via ${provider}`);

    } catch (error) {
      console.error('[LanguageDialectDemo] TTS error:', error);
      toast.error('TTS generation not available in demo mode');
    } finally {
      setLoadingCode(null);
    }
  };

  const renderDialectCard = (dialect: DialectItem, isRTL: boolean = false) => {
    const isPlaying = playingCode === dialect.code;
    const isLoading = loadingCode === dialect.code;

    return (
      <div 
        key={dialect.code} 
        className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition group cursor-pointer"
        onClick={() => handlePlayDialect(dialect.code)}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">{dialect.name}</span>
            {dialect.nativeName && (
              <span className="text-muted-foreground text-xs">({dialect.nativeName})</span>
            )}
          </div>
          <span className="text-muted-foreground text-sm">{dialect.region}</span>
        </div>
        <p 
          className={`text-lg text-foreground mb-3 ${isRTL ? 'text-right' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {dialect.example}
        </p>
        <div className="flex items-center justify-between">
          <Button 
            size="sm" 
            variant={isPlaying ? 'default' : 'outline'}
            className="gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
            {isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}
          </Button>
          <Badge variant="secondary" className="text-xs">
            <Headphones className="h-3 w-3 mr-1" />
            Azure Neural
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <section id="languages" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Globe className="h-3 w-3 mr-1" />
            Competitive Moat
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            True Localization. Not Translation.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We adapt meaning, culture, and context. This is <span className="text-primary font-bold">transcreation</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">70+</p>
            <p className="text-muted-foreground">Core Languages</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">140+</p>
            <p className="text-muted-foreground">Extended</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-4xl font-bold text-accent">249+</p>
            <p className="text-muted-foreground">Translation</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'arabic' as const, label: '🇸🇦 7 Arabic Dialects', badge: 'Exclusive' },
            { id: 'indian' as const, label: '🇮🇳 22 Indian Languages', badge: 'Most complete' },
            { id: 'african' as const, label: '🌍 10 African Languages', badge: 'First mover' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLangTab(tab.id)}
              className={`relative px-6 py-3 rounded-full transition ${
                langTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Arabic Dialects Tab */}
        {langTab === 'arabic' && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
              Same Message, 7 Different Dialects
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              "Start creating amazing videos today!" — naturally localized
            </p>
            <p className="text-center text-sm text-primary mb-8">
              🔊 Click any dialect to hear the TTS preview
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARABIC_DIALECTS.map((dialect) => renderDialectCard(dialect, true))}
            </div>
            
            <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30 text-center">
              <p className="text-green-600 dark:text-green-400">
                ⭐ <strong>NO competitor offers all 7 Arabic dialects</strong> — this is our moat!
              </p>
            </div>
          </div>
        )}

        {/* Indian Languages Tab */}
        {langTab === 'indian' && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
              22 Indian Languages + Code-Mixing
            </h3>
            
            {/* Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-muted rounded-full">
                <button
                  onClick={() => setShowTranscreation(false)}
                  className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
                    !showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <X className="h-4 w-4" />
                  Literal Translation
                </button>
                <button
                  onClick={() => setShowTranscreation(true)}
                  className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
                    showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Genie Transcreation
                </button>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div 
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  !showTranscreation 
                    ? 'bg-destructive/10 border-2 border-destructive/30 scale-[1.02]' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setShowTranscreation(false)}
              >
                <p className="text-muted-foreground mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {LITERAL_VS_TRANSCREATION.literal.label}
                  </Badge>
                </p>
                <p className="text-xl text-foreground mb-3">{LITERAL_VS_TRANSCREATION.literal.text}</p>
                <p className="text-destructive text-sm">{LITERAL_VS_TRANSCREATION.literal.issue}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayDialect('hi', 'literal');
                  }}
                >
                  <Volume2 className="h-3 w-3" />
                  Listen (Robotic)
                </Button>
              </div>
              <div 
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  showTranscreation 
                    ? 'bg-green-500/10 border-2 border-green-500/30 scale-[1.02]' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setShowTranscreation(true)}
              >
                <p className="text-muted-foreground mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    {LITERAL_VS_TRANSCREATION.transcreation.label}
                  </Badge>
                </p>
                <p className="text-xl text-foreground mb-3">{LITERAL_VS_TRANSCREATION.transcreation.text}</p>
                <p className="text-green-600 dark:text-green-400 text-sm">{LITERAL_VS_TRANSCREATION.transcreation.benefit}</p>
                <Button 
                  size="sm" 
                  className="mt-4 gap-2 bg-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayDialect('hi', 'transcreation');
                  }}
                >
                  <Volume2 className="h-3 w-3" />
                  Listen (Natural)
                </Button>
              </div>
            </div>

            {/* Language Grid */}
            <p className="text-center text-sm text-primary mb-4">
              🔊 Click any language to hear the transcreated TTS
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INDIAN_LANGUAGES.map((lang) => (
                <div 
                  key={lang.code}
                  className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition cursor-pointer group"
                  onClick={() => handlePlayDialect(lang.code)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-foreground">{lang.name}</span>
                    <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{lang.region}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      {playingCode === lang.code ? (
                        <Pause className="h-3 w-3" />
                      ) : loadingCode === lang.code ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    <Badge variant="outline" className="text-xs">Code-mixed</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <span className="px-3 py-1 bg-primary/20 rounded-full text-sm text-primary">+14 more languages</span>
            </div>
          </div>
        )}

        {/* African Languages Tab */}
        {langTab === 'african' && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
              10 African Languages — First Mover Advantage
            </h3>
            <p className="text-center text-sm text-primary mb-6">
              🔊 Click any language to hear the TTS preview
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AFRICAN_LANGUAGES.map((lang) => renderDialectCard(lang, false))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-center">
              <p className="text-yellow-600 dark:text-yellow-400">
                🌍 <strong>First mover in African language AI content</strong> — 500M+ potential users
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        {onExploreMore && (
          <div className="mt-12 text-center">
            <Button size="lg" onClick={onExploreMore} className="gap-2">
              Explore All Languages
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LanguageDialectDemo;
