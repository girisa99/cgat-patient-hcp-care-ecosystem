/**
 * HERO PRODUCT SHOWCASE - ANIMATED
 * Creative animated product overview with non-human avatars
 * Voice narration via TTS, language auto-detected by IP/browser
 * 
 * FIXES: Proper audio queue, sync with visuals, cleanup on unmount
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Globe, 
  ChevronDown,
  Sparkles,
  Brain,
  Film,
  Presentation,
  Target,
  Radio,
  Layers,
  Zap,
  Wand2,
  Music,
  Mic,
  Video,
  BarChart3,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GENIE_PRODUCTS, GenieProduct, PRODUCT_DISPLAY_ORDER } from '@/constants/genie-products';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { supabase } from '@/integrations/supabase/client';
import { createManagedAudio } from '@/hooks/shared/useAudioElement';

// Product icons mapping (creative non-human avatars)
const PRODUCT_AVATARS: Record<GenieProduct, React.ReactNode> = {
  spark: <Sparkles className="h-12 w-12" />,
  mind: <Brain className="h-12 w-12" />,
  vibe: <Film className="h-12 w-12" />,
  deck: <Presentation className="h-12 w-12" />,
  hub: <Target className="h-12 w-12" />,
  arc: <Target className="h-12 w-12" />,
  cast: <Radio className="h-12 w-12" />,
  studio: <Layers className="h-12 w-12" />,
};

// Feature icons for each product
const PRODUCT_FEATURES: Record<GenieProduct, React.ReactNode[]> = {
  spark: [<Zap key="z" className="h-4 w-4" />, <Wand2 key="w" className="h-4 w-4" />, <Mic key="m" className="h-4 w-4" />],
  mind: [<Music key="m" className="h-4 w-4" />, <Mic key="mic" className="h-4 w-4" />, <Wand2 key="w" className="h-4 w-4" />],
  vibe: [<Video key="v" className="h-4 w-4" />, <Music key="m" className="h-4 w-4" />, <Film key="f" className="h-4 w-4" />],
  deck: [<Presentation key="p" className="h-4 w-4" />, <BarChart3 key="b" className="h-4 w-4" />, <Layers key="l" className="h-4 w-4" />],
  hub: [<Target key="t" className="h-4 w-4" />, <BarChart3 key="b" className="h-4 w-4" />, <Zap key="z" className="h-4 w-4" />],
  arc: [<Target key="t" className="h-4 w-4" />, <BarChart3 key="b" className="h-4 w-4" />, <Zap key="z" className="h-4 w-4" />],
  cast: [<Send key="s" className="h-4 w-4" />, <Globe key="g" className="h-4 w-4" />, <Radio key="r" className="h-4 w-4" />],
  studio: [<Layers key="l" className="h-4 w-4" />, <Wand2 key="w" className="h-4 w-4" />, <Sparkles key="s" className="h-4 w-4" />],
};

// Translations for product content
const TRANSLATIONS: Record<string, {
  intro: string;
  products: Record<GenieProduct, { name: string; tagline: string; description: string }>;
}> = {
  en: {
    intro: "Welcome to Genie Suite - Your complete AI-powered creative suite. Let me show you our 7 powerful products.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Ignite your Ideas', description: 'Transform any input into polished scripts.' },
      mind: { name: 'Genie Mind', tagline: 'AI That Understands', description: 'Enhance scripts with voice and music.' },
      vibe: { name: 'Genie Vibe', tagline: 'Script to Screen', description: 'Full audio and video production.' },
      deck: { name: 'Genie Deck', tagline: 'Ideas to Impact', description: 'AI-powered presentations.' },
      hub: { name: 'Genie Hub', tagline: 'Your Creative Command Center', description: 'Production & asset management hub.' },
      arc: { name: 'Genie Hub', tagline: 'Your Creative Command Center', description: 'Production management hub.' },
      cast: { name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', description: 'Global distribution engine.' },
      studio: { name: 'Genie Suite', tagline: 'Mind to Media', description: 'The complete creative suite.' },
    }
  },
  ar: {
    intro: "مرحباً بكم في جيني سويت - جناحكم الإبداعي الكامل المدعوم بالذكاء الاصطناعي. دعوني أعرض عليكم منتجاتنا السبعة القوية.",
    products: {
      spark: { name: 'جيني سبارك', tagline: 'أشعل أفكارك', description: 'حوّل أي مدخلات إلى نصوص مصقولة.' },
      mind: { name: 'جيني مايند', tagline: 'ذكاء اصطناعي يفهم', description: 'حسّن النصوص بالصوت والموسيقى.' },
      vibe: { name: 'جيني فايب', tagline: 'من النص إلى الشاشة', description: 'إنتاج صوتي ومرئي كامل.' },
      deck: { name: 'جيني ديك', tagline: 'من الأفكار إلى التأثير', description: 'عروض تقديمية بالذكاء الاصطناعي.' },
      hub: { name: 'جيني هَب', tagline: 'مركز قيادتك الإبداعي', description: 'مركز إدارة الإنتاج والأصول.' },
      arc: { name: 'جيني هَب', tagline: 'مركز قيادتك الإبداعي', description: 'مركز إدارة الإنتاج.' },
      cast: { name: 'جيني كاست', tagline: 'اصنع. اعرض. وسّع.', description: 'محرك التوزيع العالمي.' },
      studio: { name: 'جيني سويت', tagline: 'من الفكرة إلى الوسائط', description: 'الجناح الإبداعي الكامل.' },
    }
  },
  zh: {
    intro: "欢迎来到精灵套件 - 您的完整AI创意套件。让我向您展示我们7个强大的产品。",
    products: {
      spark: { name: '精灵火花', tagline: '点燃您的想法', description: '将任何输入转化为精美脚本。' },
      mind: { name: '精灵思维', tagline: 'AI理解一切', description: '用语音和音乐增强脚本。' },
      vibe: { name: '精灵韵律', tagline: '从脚本到屏幕', description: '完整的音视频制作。' },
      deck: { name: '精灵演示', tagline: '从想法到影响', description: 'AI驱动的演示文稿。' },
      hub: { name: '精灵中枢', tagline: '您的创意指挥中心', description: '生产和资产管理中心。' },
      arc: { name: '精灵中枢', tagline: '您的创意指挥中心', description: '生产管理中心。' },
      cast: { name: '精灵传播', tagline: '制作·展示·扩展', description: '全球分发引擎。' },
      studio: { name: '精灵套件', tagline: '从思维到媒体', description: '完整的创意套件。' },
    }
  },
  hi: {
    intro: "जीनी सुइट में आपका स्वागत है - आपका संपूर्ण AI-संचालित क्रिएटिव सूट। मुझे आपको हमारे 7 शक्तिशाली उत्पाद दिखाने दें।",
    products: {
      spark: { name: 'जीनी स्पार्क', tagline: 'अपने विचारों को जगाएं', description: 'किसी भी इनपुट को पॉलिश्ड स्क्रिप्ट में बदलें।' },
      mind: { name: 'जीनी माइंड', tagline: 'AI जो समझता है', description: 'आवाज़ और संगीत से स्क्रिप्ट को बेहतर बनाएं।' },
      vibe: { name: 'जीनी वाइब', tagline: 'स्क्रिप्ट से स्क्रीन तक', description: 'पूर्ण ऑडियो और वीडियो प्रोडक्शन।' },
      deck: { name: 'जीनी डेक', tagline: 'विचारों से प्रभाव तक', description: 'AI-संचालित प्रेजेंटेशन।' },
      hub: { name: 'जीनी हब', tagline: 'आपका क्रिएटिव कमांड सेंटर', description: 'प्रोडक्शन और एसेट मैनेजमेंट हब।' },
      arc: { name: 'जीनी हब', tagline: 'आपका क्रिएटिव कमांड सेंटर', description: 'प्रोडक्शन मैनेजमेंट हब।' },
      cast: { name: 'जीनी कास्ट', tagline: 'बनाओ. दिखाओ. बढ़ाओ.', description: 'वैश्विक वितरण इंजन।' },
      studio: { name: 'जीनी सुइट', tagline: 'मन से मीडिया', description: 'संपूर्ण क्रिएटिव सूट।' },
    }
  },
  es: {
    intro: "Bienvenido a Genie Suite - Tu suite creativa completa impulsada por IA. Déjame mostrarte nuestros 7 potentes productos.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Enciende tus Ideas', description: 'Transforma cualquier entrada en guiones pulidos.' },
      mind: { name: 'Genie Mind', tagline: 'IA que Entiende', description: 'Mejora guiones con voz y música.' },
      vibe: { name: 'Genie Vibe', tagline: 'Del Guión a la Pantalla', description: 'Producción completa de audio y video.' },
      deck: { name: 'Genie Deck', tagline: 'Ideas con Impacto', description: 'Presentaciones potenciadas por IA.' },
      hub: { name: 'Genie Hub', tagline: 'Tu Centro de Comando Creativo', description: 'Centro de gestión de producción y activos.' },
      arc: { name: 'Genie Hub', tagline: 'Tu Centro de Comando Creativo', description: 'Centro de gestión de producción.' },
      cast: { name: 'Genie Cast', tagline: 'Crea. Muestra. Escala.', description: 'Motor de distribución global.' },
      studio: { name: 'Genie Suite', tagline: 'De la Mente al Medio', description: 'La suite creativa completa.' },
    }
  },
  fr: {
    intro: "Bienvenue dans Genie Suite - Votre suite créative complète alimentée par l'IA. Laissez-moi vous présenter nos 7 produits puissants.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Allumez vos Idées', description: 'Transformez toute entrée en scripts soignés.' },
      mind: { name: 'Genie Mind', tagline: 'IA qui Comprend', description: 'Améliorez les scripts avec voix et musique.' },
      vibe: { name: 'Genie Vibe', tagline: 'Du Script à l\'Écran', description: 'Production audio et vidéo complète.' },
      deck: { name: 'Genie Deck', tagline: 'Des Idées à l\'Impact', description: 'Présentations propulsées par l\'IA.' },
      hub: { name: 'Genie Hub', tagline: 'Votre Centre de Commande Créatif', description: 'Hub de gestion de production et d\'actifs.' },
      arc: { name: 'Genie Hub', tagline: 'Votre Centre de Commande Créatif', description: 'Hub de gestion de production.' },
      cast: { name: 'Genie Cast', tagline: 'Créez. Montrez. Évoluez.', description: 'Moteur de distribution mondiale.' },
      studio: { name: 'Genie Suite', tagline: 'De l\'Esprit au Média', description: 'La suite créative complète.' },
    }
  },
  ja: {
    intro: "Genie Suiteへようこそ - AI搭載の完全なクリエイティブスイート。7つの強力な製品をご紹介します。",
    products: {
      spark: { name: 'Genie Spark', tagline: 'アイデアに火をつける', description: 'あらゆる入力を洗練されたスクリプトに変換。' },
      mind: { name: 'Genie Mind', tagline: '理解するAI', description: '音声と音楽でスクリプトを強化。' },
      vibe: { name: 'Genie Vibe', tagline: 'スクリプトからスクリーンへ', description: '完全なオーディオ・ビデオ制作。' },
      deck: { name: 'Genie Deck', tagline: 'アイデアからインパクトへ', description: 'AI搭載のプレゼンテーション。' },
      hub: { name: 'Genie Hub', tagline: 'クリエイティブコマンドセンター', description: '制作・資産管理ハブ。' },
      arc: { name: 'Genie Hub', tagline: 'クリエイティブコマンドセンター', description: '制作管理ハブ。' },
      cast: { name: 'Genie Cast', tagline: '作る・見せる・広げる', description: 'グローバル配信エンジン。' },
      studio: { name: 'Genie Suite', tagline: '心からメディアへ', description: '完全なクリエイティブスイート。' },
    }
  },
  ko: {
    intro: "Genie Suite에 오신 것을 환영합니다 - AI 기반 완벽한 크리에이티브 스위트. 7가지 강력한 제품을 소개해 드리겠습니다.",
    products: {
      spark: { name: 'Genie Spark', tagline: '아이디어에 불을 붙이세요', description: '모든 입력을 세련된 스크립트로 변환.' },
      mind: { name: 'Genie Mind', tagline: '이해하는 AI', description: '음성과 음악으로 스크립트 향상.' },
      vibe: { name: 'Genie Vibe', tagline: '스크립트에서 스크린으로', description: '완벽한 오디오 및 비디오 제작.' },
      deck: { name: 'Genie Deck', tagline: '아이디어에서 임팩트로', description: 'AI 기반 프레젠테이션.' },
      hub: { name: 'Genie Hub', tagline: '크리에이티브 커맨드 센터', description: '프로덕션 및 자산 관리 허브.' },
      arc: { name: 'Genie Hub', tagline: '크리에이티브 커맨드 센터', description: '프로덕션 관리 허브.' },
      cast: { name: 'Genie Cast', tagline: '만들고. 보여주고. 확장하세요.', description: '글로벌 배포 엔진.' },
      studio: { name: 'Genie Suite', tagline: '마음에서 미디어로', description: '완벽한 크리에이티브 스위트.' },
    }
  },
  pt: {
    intro: "Bem-vindo ao Genie Suite - Sua suíte criativa completa com IA. Deixe-me mostrar nossos 7 produtos poderosos.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Acenda suas Ideias', description: 'Transforme qualquer entrada em roteiros polidos.' },
      mind: { name: 'Genie Mind', tagline: 'IA que Entende', description: 'Aprimore roteiros com voz e música.' },
      vibe: { name: 'Genie Vibe', tagline: 'Do Roteiro à Tela', description: 'Produção completa de áudio e vídeo.' },
      deck: { name: 'Genie Deck', tagline: 'Ideias com Impacto', description: 'Apresentações impulsionadas por IA.' },
      hub: { name: 'Genie Hub', tagline: 'Seu Centro de Comando Criativo', description: 'Hub de gestão de produção e ativos.' },
      arc: { name: 'Genie Hub', tagline: 'Seu Centro de Comando Criativo', description: 'Hub de gestão de produção.' },
      cast: { name: 'Genie Cast', tagline: 'Crie. Mostre. Escale.', description: 'Motor de distribuição global.' },
      studio: { name: 'Genie Suite', tagline: 'Da Mente à Mídia', description: 'A suíte criativa completa.' },
    }
  },
};

// Language names for dropdown
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  zh: '中文',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
};

// Audio queue manager for synchronized playback
interface AudioQueueItem {
  text: string;
  productIndex: number;
}

export const HeroProductShowcaseAnimated: React.FC = () => {
  const { selectedRegion, setRegion, isRTL } = useRegionalDetection();
  const [currentProductIndex, setCurrentProductIndex] = useState(-1); // -1 for intro
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  
  // Refs for cleanup
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const currentLanguage = TRANSLATIONS[selectedRegion] ? selectedRegion : 'en';
  const translations = TRANSLATIONS[currentLanguage];
  const products = PRODUCT_DISPLAY_ORDER.filter(p => p !== 'studio');

  // Get current content
  const getCurrentContent = useCallback(() => {
    if (currentProductIndex === -1) {
      return {
        title: 'Genie Suite',
        tagline: 'Mind to Media',
        description: translations.intro,
        product: null,
        productKey: 'studio' as GenieProduct,
      };
    }
    const productKey = products[currentProductIndex];
    const product = GENIE_PRODUCTS[productKey];
    const translated = translations.products[productKey];
    return {
      title: translated.name,
      tagline: translated.tagline,
      description: translated.description,
      product,
      productKey,
    };
  }, [currentProductIndex, translations, products]);

  // Cleanup function for audio
  const cleanupAudio = useCallback(() => {
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    audioRef.current = null;
  }, []);

  // Generate and play TTS audio
  const generateAndPlayAudio = useCallback(async (text: string) => {
    if (!mountedRef.current) return;
    
    // Cleanup previous audio
    cleanupAudio();
    setIsGeneratingAudio(true);
    setAudioReady(false);
    
    try {
      console.log('[HeroShowcase] Generating audio for:', text.substring(0, 50) + '...');
      
      const response = await supabase.functions.invoke('elevenlabs-voice', {
        body: {
          text,
          voice: 'george',
        },
      });

      if (!mountedRef.current) return;

      if (response.error) {
        console.error('[HeroShowcase] TTS error:', response.error);
        setIsGeneratingAudio(false);
        return;
      }

      if (response.data?.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${response.data.audioContent}`;
        
        const { audio, cleanup } = createManagedAudio(audioUrl, {
          onPlay: () => {
            console.log('[HeroShowcase] Audio started playing');
            setAudioReady(true);
          },
          onEnded: () => {
            console.log('[HeroShowcase] Audio ended');
            // Auto-advance to next product when audio ends
            if (mountedRef.current && isPlaying) {
              setCurrentProductIndex(prev => {
                const next = prev + 1;
                return next >= products.length ? -1 : next;
              });
            }
          },
          onError: (error) => {
            console.error('[HeroShowcase] Audio error:', error);
          },
        });
        
        audioRef.current = audio;
        audioCleanupRef.current = cleanup;
        
        // Play the audio
        await audio.play();
        console.log('[HeroShowcase] Audio playing');
      }
    } catch (error) {
      console.error('[HeroShowcase] TTS generation error:', error);
    } finally {
      if (mountedRef.current) {
        setIsGeneratingAudio(false);
      }
    }
  }, [cleanupAudio, isPlaying, products.length]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupAudio();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cleanupAudio]);

  // Handle product changes - trigger audio when unmuted
  useEffect(() => {
    if (!isMuted && isPlaying) {
      const content = getCurrentContent();
      const text = `${content.title}. ${content.tagline}. ${content.description}`;
      generateAndPlayAudio(text);
    }
  }, [currentProductIndex, isMuted, currentLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance when muted (no audio sync needed)
  useEffect(() => {
    if (!isPlaying || !isMuted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentProductIndex(prev => {
        const next = prev + 1;
        return next >= products.length ? -1 : next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isMuted, products.length]);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    } else {
      // Resume
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      // Muting - stop current audio
      cleanupAudio();
    } else {
      // Unmuting - start audio for current product
      const content = getCurrentContent();
      const text = `${content.title}. ${content.tagline}. ${content.description}`;
      generateAndPlayAudio(text);
    }
  };

  const goToProduct = (index: number) => {
    setCurrentProductIndex(index);
    // Audio will be triggered by the useEffect watching currentProductIndex
  };

  const content = getCurrentContent();
  const progress = ((currentProductIndex + 2) / (products.length + 1)) * 100;

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border bg-gradient-to-br from-background via-card to-muted"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="aspect-video relative p-6 md:p-8 flex flex-col justify-center items-center min-h-[400px]">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 8,
                background: `hsl(var(--primary) / ${0.1 + Math.random() * 0.3})`,
              }}
              initial={{ 
                x: `${Math.random() * 100}%`,
                y: `${100 + Math.random() * 20}%`,
                scale: 0 
              }}
              animate={{
                y: [null, `${-10 - Math.random() * 20}%`],
                scale: [0, 1, 0.5, 0],
                opacity: [0, 0.8, 0.4, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Animated gradient orbs in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl"
            animate={{
              x: ['-20%', '60%', '-20%'],
              y: ['20%', '60%', '20%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-accent/20 to-accent/5 blur-3xl"
            animate={{
              x: ['80%', '20%', '80%'],
              y: ['60%', '20%', '60%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Language Selector - Top Left */}
        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-background/90 backdrop-blur gap-2 border shadow-lg"
              >
                <Globe className="h-4 w-4" />
                {LANGUAGE_NAMES[currentLanguage]}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border-border z-50">
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setRegion(code as any)}
                  className={`cursor-pointer ${currentLanguage === code ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* AI Badge - Top Right */}
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex items-center gap-2 z-20`}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background/90 rounded-full backdrop-blur border shadow-lg">
            <motion.span 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-primary">AI Powered</span>
          </div>
          {isGeneratingAudio && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/90 rounded-full backdrop-blur border shadow-lg">
              <motion.div
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <span className="text-xs text-muted-foreground">Loading audio...</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentProductIndex}-${currentLanguage}`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 text-center max-w-3xl mx-auto"
          >
            {/* Animated Avatar/Icon with enhanced visuals */}
            <motion.div 
              className="mx-auto mb-8 relative"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow effect behind icon */}
              <motion.div
                className="absolute inset-0 rounded-3xl blur-xl"
                style={{
                  background: content.product?.color 
                    ? `linear-gradient(135deg, ${content.product.color.replace('from-', '').replace('to-', ', ')})` 
                    : 'hsl(var(--primary) / 0.3)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Main icon container */}
              <motion.div 
                className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${
                  content.product?.color || 'from-primary to-primary/80'
                } flex items-center justify-center text-white shadow-2xl`}
                animate={{ 
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {PRODUCT_AVATARS[content.productKey]}
              </motion.div>
              
              {/* Orbiting feature icons */}
              {PRODUCT_FEATURES[content.productKey]?.map((icon, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center text-primary shadow-lg"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: 'linear',
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: `${70 + i * 15}px 0`,
                  }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: 'linear' }}
                  >
                    {icon}
                  </motion.div>
                </motion.div>
              ))}

              {/* Pulse rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-3xl border-2 border-primary/20"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Title with gradient */}
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {content.title}
            </motion.h2>

            {/* Tagline with primary color */}
            <motion.p
              className="text-2xl md:text-3xl font-semibold text-primary mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              "{content.tagline}"
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {content.description}
            </motion.p>

            {/* Audio visualization when playing */}
            {!isMuted && audioReady && (
              <motion.div 
                className="mt-6 flex justify-center items-end gap-1 h-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{
                      height: [8, 20 + Math.random() * 12, 8],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.3,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Product Indicators */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <button
            onClick={() => goToProduct(-1)}
            className={`w-10 h-2 rounded-full transition-all duration-300 ${
              currentProductIndex === -1 
                ? 'bg-primary shadow-lg shadow-primary/30' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            title="Genie Studio"
          />
          {products.map((product, idx) => (
            <button
              key={product}
              onClick={() => goToProduct(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentProductIndex === idx 
                  ? 'bg-primary scale-150 shadow-lg shadow-primary/30' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              title={GENIE_PRODUCTS[product].name}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-16 left-6 right-6 md:left-8 md:right-8 z-10">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlay} 
              className="h-9 w-9 bg-background/50 backdrop-blur border"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute} 
              className="h-9 w-9 bg-background/50 backdrop-blur border"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {currentProductIndex === -1 ? 'Overview' : `${currentProductIndex + 1} of ${products.length}`}
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              7 Products
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcaseAnimated;
