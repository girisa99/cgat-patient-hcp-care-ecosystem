/**
 * HERO PRODUCT SHOWCASE - ANIMATED
 * Creative animated product overview with non-human avatars
 * Voice narration via TTS, language auto-detected by IP/browser
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
  Layers
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

// Product icons mapping (creative non-human avatars)
const PRODUCT_AVATARS: Record<GenieProduct, React.ReactNode> = {
  spark: <Sparkles className="h-8 w-8" />,
  mind: <Brain className="h-8 w-8" />,
  vibe: <Film className="h-8 w-8" />,
  deck: <Presentation className="h-8 w-8" />,
  arc: <Target className="h-8 w-8" />,
  cast: <Radio className="h-8 w-8" />,
  studio: <Layers className="h-8 w-8" />,
};

// Translations for product content
const TRANSLATIONS: Record<string, {
  intro: string;
  products: Record<GenieProduct, { name: string; tagline: string; description: string }>;
}> = {
  en: {
    intro: "Welcome to Genie Studio - Your complete AI-powered creative suite. Let me show you our 7 powerful products.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Ignite your Ideas', description: 'Transform any input into polished scripts.' },
      mind: { name: 'Genie Mind', tagline: 'AI That Understands', description: 'Enhance scripts with voice and music.' },
      vibe: { name: 'Genie Vibe', tagline: 'Script to Screen', description: 'Full audio and video production.' },
      deck: { name: 'Genie Deck', tagline: 'Ideas to Impact', description: 'AI-powered presentations.' },
      arc: { name: 'Genie Arc', tagline: 'Infinite Possibilities', description: 'Production management hub.' },
      cast: { name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', description: 'Global distribution engine.' },
      studio: { name: 'Genie Studio', tagline: 'Mind to Media', description: 'The complete creative suite.' },
    }
  },
  ar: {
    intro: "مرحباً بكم في جيني ستوديو - جناحكم الإبداعي الكامل المدعوم بالذكاء الاصطناعي. دعوني أعرض عليكم منتجاتنا السبعة القوية.",
    products: {
      spark: { name: 'جيني سبارك', tagline: 'أشعل أفكارك', description: 'حوّل أي مدخلات إلى نصوص مصقولة.' },
      mind: { name: 'جيني مايند', tagline: 'ذكاء اصطناعي يفهم', description: 'حسّن النصوص بالصوت والموسيقى.' },
      vibe: { name: 'جيني فايب', tagline: 'من النص إلى الشاشة', description: 'إنتاج صوتي ومرئي كامل.' },
      deck: { name: 'جيني ديك', tagline: 'من الأفكار إلى التأثير', description: 'عروض تقديمية بالذكاء الاصطناعي.' },
      arc: { name: 'جيني آرك', tagline: 'إمكانيات لا نهائية', description: 'مركز إدارة الإنتاج.' },
      cast: { name: 'جيني كاست', tagline: 'اصنع. اعرض. وسّع.', description: 'محرك التوزيع العالمي.' },
      studio: { name: 'جيني ستوديو', tagline: 'من الفكرة إلى الوسائط', description: 'الجناح الإبداعي الكامل.' },
    }
  },
  zh: {
    intro: "欢迎来到精灵工作室 - 您的完整AI创意套件。让我向您展示我们7个强大的产品。",
    products: {
      spark: { name: '精灵火花', tagline: '点燃您的想法', description: '将任何输入转化为精美脚本。' },
      mind: { name: '精灵思维', tagline: 'AI理解一切', description: '用语音和音乐增强脚本。' },
      vibe: { name: '精灵韵律', tagline: '从脚本到屏幕', description: '完整的音视频制作。' },
      deck: { name: '精灵演示', tagline: '从想法到影响', description: 'AI驱动的演示文稿。' },
      arc: { name: '精灵弧', tagline: '无限可能', description: '生产管理中心。' },
      cast: { name: '精灵传播', tagline: '制作·展示·扩展', description: '全球分发引擎。' },
      studio: { name: '精灵工作室', tagline: '从思维到媒体', description: '完整的创意套件。' },
    }
  },
  hi: {
    intro: "जीनी स्टूडियो में आपका स्वागत है - आपका संपूर्ण AI-संचालित क्रिएटिव सूट। मुझे आपको हमारे 7 शक्तिशाली उत्पाद दिखाने दें।",
    products: {
      spark: { name: 'जीनी स्पार्क', tagline: 'अपने विचारों को जगाएं', description: 'किसी भी इनपुट को पॉलिश्ड स्क्रिप्ट में बदलें।' },
      mind: { name: 'जीनी माइंड', tagline: 'AI जो समझता है', description: 'आवाज़ और संगीत से स्क्रिप्ट को बेहतर बनाएं।' },
      vibe: { name: 'जीनी वाइब', tagline: 'स्क्रिप्ट से स्क्रीन तक', description: 'पूर्ण ऑडियो और वीडियो प्रोडक्शन।' },
      deck: { name: 'जीनी डेक', tagline: 'विचारों से प्रभाव तक', description: 'AI-संचालित प्रेजेंटेशन।' },
      arc: { name: 'जीनी आर्क', tagline: 'अनंत संभावनाएं', description: 'प्रोडक्शन मैनेजमेंट हब।' },
      cast: { name: 'जीनी कास्ट', tagline: 'बनाओ. दिखाओ. बढ़ाओ.', description: 'वैश्विक वितरण इंजन।' },
      studio: { name: 'जीनी स्टूडियो', tagline: 'मन से मीडिया', description: 'संपूर्ण क्रिएटिव सूट।' },
    }
  },
  es: {
    intro: "Bienvenido a Genie Studio - Tu suite creativa completa impulsada por IA. Déjame mostrarte nuestros 7 potentes productos.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Enciende tus Ideas', description: 'Transforma cualquier entrada en guiones pulidos.' },
      mind: { name: 'Genie Mind', tagline: 'IA que Entiende', description: 'Mejora guiones con voz y música.' },
      vibe: { name: 'Genie Vibe', tagline: 'Del Guión a la Pantalla', description: 'Producción completa de audio y video.' },
      deck: { name: 'Genie Deck', tagline: 'Ideas con Impacto', description: 'Presentaciones potenciadas por IA.' },
      arc: { name: 'Genie Arc', tagline: 'Posibilidades Infinitas', description: 'Centro de gestión de producción.' },
      cast: { name: 'Genie Cast', tagline: 'Crea. Muestra. Escala.', description: 'Motor de distribución global.' },
      studio: { name: 'Genie Studio', tagline: 'De la Mente al Medio', description: 'La suite creativa completa.' },
    }
  },
  fr: {
    intro: "Bienvenue dans Genie Studio - Votre suite créative complète alimentée par l'IA. Laissez-moi vous présenter nos 7 produits puissants.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Allumez vos Idées', description: 'Transformez toute entrée en scripts soignés.' },
      mind: { name: 'Genie Mind', tagline: 'IA qui Comprend', description: 'Améliorez les scripts avec voix et musique.' },
      vibe: { name: 'Genie Vibe', tagline: 'Du Script à l\'Écran', description: 'Production audio et vidéo complète.' },
      deck: { name: 'Genie Deck', tagline: 'Des Idées à l\'Impact', description: 'Présentations propulsées par l\'IA.' },
      arc: { name: 'Genie Arc', tagline: 'Possibilités Infinies', description: 'Hub de gestion de production.' },
      cast: { name: 'Genie Cast', tagline: 'Créez. Montrez. Évoluez.', description: 'Moteur de distribution mondiale.' },
      studio: { name: 'Genie Studio', tagline: 'De l\'Esprit au Média', description: 'La suite créative complète.' },
    }
  },
  ja: {
    intro: "Genie Studioへようこそ - AI搭載の完全なクリエイティブスイート。7つの強力な製品をご紹介します。",
    products: {
      spark: { name: 'Genie Spark', tagline: 'アイデアに火をつける', description: 'あらゆる入力を洗練されたスクリプトに変換。' },
      mind: { name: 'Genie Mind', tagline: '理解するAI', description: '音声と音楽でスクリプトを強化。' },
      vibe: { name: 'Genie Vibe', tagline: 'スクリプトからスクリーンへ', description: '完全なオーディオ・ビデオ制作。' },
      deck: { name: 'Genie Deck', tagline: 'アイデアからインパクトへ', description: 'AI搭載のプレゼンテーション。' },
      arc: { name: 'Genie Arc', tagline: '無限の可能性', description: '制作管理ハブ。' },
      cast: { name: 'Genie Cast', tagline: '作る・見せる・広げる', description: 'グローバル配信エンジン。' },
      studio: { name: 'Genie Studio', tagline: '心からメディアへ', description: '完全なクリエイティブスイート。' },
    }
  },
  ko: {
    intro: "Genie Studio에 오신 것을 환영합니다 - AI 기반 완벽한 크리에이티브 스위트. 7가지 강력한 제품을 소개해 드리겠습니다.",
    products: {
      spark: { name: 'Genie Spark', tagline: '아이디어에 불을 붙이세요', description: '모든 입력을 세련된 스크립트로 변환.' },
      mind: { name: 'Genie Mind', tagline: '이해하는 AI', description: '음성과 음악으로 스크립트 향상.' },
      vibe: { name: 'Genie Vibe', tagline: '스크립트에서 스크린으로', description: '완벽한 오디오 및 비디오 제작.' },
      deck: { name: 'Genie Deck', tagline: '아이디어에서 임팩트로', description: 'AI 기반 프레젠테이션.' },
      arc: { name: 'Genie Arc', tagline: '무한한 가능성', description: '프로덕션 관리 허브.' },
      cast: { name: 'Genie Cast', tagline: '만들고. 보여주고. 확장하세요.', description: '글로벌 배포 엔진.' },
      studio: { name: 'Genie Studio', tagline: '마음에서 미디어로', description: '완벽한 크리에이티브 스위트.' },
    }
  },
  pt: {
    intro: "Bem-vindo ao Genie Studio - Sua suíte criativa completa com IA. Deixe-me mostrar nossos 7 produtos poderosos.",
    products: {
      spark: { name: 'Genie Spark', tagline: 'Acenda suas Ideias', description: 'Transforme qualquer entrada em roteiros polidos.' },
      mind: { name: 'Genie Mind', tagline: 'IA que Entende', description: 'Aprimore roteiros com voz e música.' },
      vibe: { name: 'Genie Vibe', tagline: 'Do Roteiro à Tela', description: 'Produção completa de áudio e vídeo.' },
      deck: { name: 'Genie Deck', tagline: 'Ideias com Impacto', description: 'Apresentações impulsionadas por IA.' },
      arc: { name: 'Genie Arc', tagline: 'Possibilidades Infinitas', description: 'Hub de gestão de produção.' },
      cast: { name: 'Genie Cast', tagline: 'Crie. Mostre. Escale.', description: 'Motor de distribuição global.' },
      studio: { name: 'Genie Studio', tagline: 'Da Mente à Mídia', description: 'A suíte criativa completa.' },
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

export const HeroProductShowcaseAnimated: React.FC = () => {
  const { selectedRegion, setRegion, isRTL } = useRegionalDetection();
  const [currentProductIndex, setCurrentProductIndex] = useState(-1); // -1 for intro
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentLanguage = TRANSLATIONS[selectedRegion] ? selectedRegion : 'en';
  const translations = TRANSLATIONS[currentLanguage];
  const products = PRODUCT_DISPLAY_ORDER.filter(p => p !== 'studio');

  // Get current content
  const getCurrentContent = useCallback(() => {
    if (currentProductIndex === -1) {
      return {
        title: 'Genie Studio',
        tagline: 'Mind to Media',
        description: translations.intro,
        product: null,
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

  // Auto-advance products
  useEffect(() => {
    if (!isPlaying) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentProductIndex(prev => {
        const next = prev + 1;
        return next >= products.length ? -1 : next;
      });
    }, 4000); // 4 seconds per product

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, products.length]);

  // Generate TTS audio for current content
  const generateAudio = useCallback(async (text: string) => {
    if (isMuted || isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    try {
      // Stop previous audio
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }

      const response = await supabase.functions.invoke('elevenlabs-voice', {
        body: {
          text,
          voice: 'george', // Professional male voice
          action: 'generate',
        },
      });

      if (response.data?.audioContent) {
        // Use data URI for base64 audio
        const audioUrl = `data:audio/mpeg;base64,${response.data.audioContent}`;
        const audio = new Audio(audioUrl);
        audio.play().catch(console.error);
        setAudioElement(audio);
      }
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [isMuted, isGeneratingAudio, audioElement]);

  // Play audio when product changes and unmuted
  useEffect(() => {
    if (!isMuted && isPlaying) {
      const content = getCurrentContent();
      generateAudio(`${content.title}. ${content.tagline}. ${content.description}`);
    }
  }, [currentProductIndex, isMuted, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioElement) {
      isPlaying ? audioElement.pause() : audioElement.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioElement) {
      audioElement.muted = !isMuted;
    }
  };

  const content = getCurrentContent();
  const progress = ((currentProductIndex + 2) / (products.length + 1)) * 100;

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border bg-gradient-to-br from-background via-card to-muted"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="aspect-video relative p-8 flex flex-col justify-center items-center">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: 0 
              }}
              animate={{
                y: [null, '-20%'],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Language Selector - Top Left */}
        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-background/80 backdrop-blur gap-2 border"
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
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex items-center gap-2`}>
          <div className="flex items-center gap-2 px-3 py-1 bg-background/80 rounded-full backdrop-blur border">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400">AI Animated</span>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProductIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center max-w-2xl mx-auto"
          >
            {/* Animated Avatar/Icon */}
            <motion.div 
              className="mx-auto mb-6 relative"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${
                content.product?.color || 'from-primary to-primary/80'
              } flex items-center justify-center text-white shadow-lg`}>
                {content.productKey ? PRODUCT_AVATARS[content.productKey] : (
                  <Layers className="h-10 w-10" />
                )}
              </div>
              
              {/* Orbiting particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-primary/60"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: 'linear',
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: `${40 + i * 10}px 0`,
                  }}
                />
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {content.title}
            </motion.h2>

            {/* Tagline */}
            <motion.p
              className="text-xl md:text-2xl font-medium text-primary mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "{content.tagline}"
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {content.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Product Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={() => setCurrentProductIndex(-1)}
            className={`w-8 h-2 rounded-full transition-all ${
              currentProductIndex === -1 ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            title="Genie Studio"
          />
          {products.map((product, idx) => (
            <button
              key={product}
              onClick={() => setCurrentProductIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentProductIndex === idx ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              title={GENIE_PRODUCTS[product].name}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-12 left-8 right-8">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlay} 
              className="h-8 w-8"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute} 
              className="h-8 w-8"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {isGeneratingAudio && (
              <span className="text-xs text-muted-foreground">Loading audio...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentProductIndex === -1 ? 'Intro' : `${currentProductIndex + 1}/${products.length}`}
            </span>
            <span className="px-2 py-1 bg-muted rounded text-xs">
              7 Products
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcaseAnimated;
