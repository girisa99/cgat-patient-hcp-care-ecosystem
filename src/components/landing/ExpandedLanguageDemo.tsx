/**
 * EXPANDED LANGUAGE DEMO
 * 
 * Extended version of InteractiveLanguageDemo with CJK, SEA, LATAM, Caribbean tabs.
 * All content is TRANSCREATED — culturally adapted, not literally translated.
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// LANGUAGE DATA — TRANSCREATION EXAMPLES
// ============================================

const LANGUAGE_TABS = [
  { id: 'arabic', label: '🇸🇦 Arabic Dialects', badge: 'Exclusive', count: 7 },
  { id: 'indian', label: '🇮🇳 Indian Languages', badge: 'Most complete', count: 11 },
  { id: 'cjk', label: '🇯🇵 CJK Languages', badge: 'Native CJK', count: 6 },
  { id: 'african', label: '🌍 African Languages', badge: 'First mover', count: 10 },
  { id: 'latam', label: '🇧🇷 LATAM Variants', badge: 'Transcreated', count: 6 },
  { id: 'european', label: '🇪🇺 European Languages', badge: 'GDPR ready', count: 8 },
] as const;

type TabId = typeof LANGUAGE_TABS[number]['id'];

interface LanguageExample {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  transcreation: string;
  literal: string;
  provider: string;
}

const LANGUAGE_DATA: Record<TabId, { title: string; subtitle: string; moat: string; languages: LanguageExample[] }> = {
  arabic: {
    title: 'Same Message, 7 Different Dialects',
    subtitle: '"Start creating amazing videos!" — naturally localized per dialect',
    moat: '⭐ NO competitor offers all 7 Arabic dialects — this is our exclusive moat!',
    languages: [
      { code: 'ar-SA', name: 'Saudi', nativeName: 'سعودي', region: 'Saudi Arabia', transcreation: 'ابدأ تسوي فيديوهات روعة — مجاناً!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-EG', name: 'Egyptian', nativeName: 'مصري', region: 'Egypt', transcreation: 'ابدأ اعمل فيديوهات جامدة — ببلاش!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-AE', name: 'Gulf', nativeName: 'خليجي', region: 'UAE/Gulf', transcreation: 'ابدا سوّي فيديوهات حلوة — مجان!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-LB', name: 'Levantine', nativeName: 'لبناني', region: 'Lebanon/Syria', transcreation: 'بلّش اعمل فيديوهات كتير حلوة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-MA', name: 'Maghrebi', nativeName: 'مغربي', region: 'Morocco', transcreation: 'بدا دير فيديوهات زوينين!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-IQ', name: 'Iraqi', nativeName: 'عراقي', region: 'Iraq', transcreation: 'ابدي سوّي فيديوهات روعة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
      { code: 'ar-MSA', name: 'MSA', nativeName: 'فصحى', region: 'Formal/News', transcreation: 'ابدأ بإنشاء مقاطع فيديو احترافية', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة', provider: 'Azure Neural' },
    ],
  },
  indian: {
    title: '11 Indian Languages + Code-Mixing',
    subtitle: 'Natural speech with English terms — how India actually talks',
    moat: '🇮🇳 11 Indian languages with code-mixing — unmatched regional depth',
    languages: [
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', region: 'North India', transcreation: 'AI course creator फ्री में ट्राई करो! एकदम मस्त है!', literal: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं', provider: 'Azure Neural' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu', transcreation: 'AI course creator free-ஆ try பண்ணு! சூப்பரா இருக்கு!', literal: 'எங்கள் AI-இயக்கப்படும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்', provider: 'Azure Neural' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra/Telangana', transcreation: 'AI course creator free-గా try చెయ్యి! చాలా బాగుంది!', literal: 'దయచేసి మా AI-ఆధారిత కోర్సు సృష్టికర్తను ఉచితంగా ప్రయత్నించండి', provider: 'Azure Neural' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal', transcreation: 'AI course creator free-তে try করো! একদম ঝাক্কাস!', literal: 'অনুগ্রহ করে আমাদের AI-চালিত কোর্স নির্মাতা বিনামূল্যে চেষ্টা করুন', provider: 'Azure Neural' },
      { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra', transcreation: 'AI course creator free मध्ये try करा! एकदम भारी आहे!', literal: 'कृपया आमचे AI-संचालित कोर्स निर्माता विनामूल्य वापरून पहा', provider: 'Azure Neural' },
      { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat', transcreation: 'AI course creator free માં try કરો! એકદમ મસ્ત છે!', literal: 'કૃપા કરીને અમારા AI-સંચાલિત કોર્સ નિર્માતાને મફતમાં અજમાવો', provider: 'Azure Neural' },
      { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka', transcreation: 'AI course creator free ಆಗಿ try ಮಾಡಿ! ಸೂಪರ್ ಇದೆ!', literal: 'ದಯವಿಟ್ಟು ನಮ್ಮ AI-ಚಾಲಿತ ಕೋರ್ಸ್ ಸೃಷ್ಟಿಕರ್ತವನ್ನು ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ', provider: 'Azure Neural' },
      { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala', transcreation: 'AI course creator free ആയി try ചെയ്യൂ! കിടുക്കാച്ചി!', literal: 'ദയവായി ഞങ്ങളുടെ AI-പവർഡ് കോഴ്സ് ക്രിയേറ്റർ സൗജന്യമായി പരീക്ഷിക്കുക', provider: 'Azure Neural' },
    ],
  },
  cjk: {
    title: 'CJK + Southeast Asian Languages',
    subtitle: 'Full CJK typography, tonal TTS, and cultural adaptation',
    moat: '🌏 Native CJK transcreation via Qwen-Max — not generic machine translation',
    languages: [
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', region: 'Japan', transcreation: 'AIで動画制作を始めよう — 無料で、すぐに使えます！', literal: '当社のAI動画制作ツールを無料でお試しください', provider: 'Azure Neural' },
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', region: 'China', transcreation: '用AI来创作精彩视频吧——完全免费，立即上手！', literal: '请免费试用我们的AI视频制作工具', provider: 'Azure Neural' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어', region: 'South Korea', transcreation: 'AI로 멋진 영상 만들어 보세요 — 무료로 바로 시작!', literal: '당사의 AI 비디오 제작 도구를 무료로 사용해 보세요', provider: 'Azure Neural' },
      { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', region: 'Thailand', transcreation: 'เริ่มสร้างวิดีโอสุดเจ๋งด้วย AI — ฟรี ไม่มีข้อผูกมัด!', literal: 'กรุณาลองใช้เครื่องมือสร้างวิดีโอ AI ของเราฟรี', provider: 'Azure Neural' },
      { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam', transcreation: 'Bắt đầu tạo video tuyệt vời với AI — miễn phí hoàn toàn!', literal: 'Vui lòng dùng thử công cụ tạo video AI của chúng tôi miễn phí', provider: 'Azure Neural' },
      { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Indonesia', transcreation: 'Mulai bikin video keren pakai AI — gratis, tanpa ribet!', literal: 'Silakan coba alat pembuat video AI kami secara gratis', provider: 'Azure Neural' },
    ],
  },
  african: {
    title: '10 African Languages — First Mover',
    subtitle: 'Reaching 1.4B+ people in their native languages',
    moat: '🌍 First mover in African language AI content — 1.4B+ potential users',
    languages: [
      { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', region: 'Kenya/Tanzania', transcreation: 'Anza kuunda video za kushangaza — bure kabisa!', literal: 'Begin creating excellent video content for free', provider: 'Azure Neural' },
      { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', region: 'Nigeria', transcreation: 'Bẹ̀rẹ̀ ṣíṣe fidio to dára — ọfẹ́ ni!', literal: 'Begin creating excellent video content for free', provider: 'Azure Neural' },
      { code: 'ha-NG', name: 'Hausa', nativeName: 'Hausa', region: 'Nigeria', transcreation: 'Fara yin bidiyo mai kyau — ba tare da biyan kuɗi ba!', literal: 'Begin creating excellent video content for free', provider: 'Azure Neural' },
      { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', region: 'South Africa', transcreation: 'Qala ukwenza amavidiyo amahle — mahhala!', literal: 'Begin creating excellent video content for free', provider: 'Azure Neural' },
      { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', region: 'Ethiopia', transcreation: 'አስደናቂ ቪዲዮዎችን መፍጠር ጀምር — ነጻ!', literal: 'Begin creating excellent video content for free', provider: 'Azure Neural' },
    ],
  },
  latam: {
    title: 'LATAM Spanish & Portuguese Variants',
    subtitle: 'Mexican ≠ Colombian ≠ Argentine — every variant feels native',
    moat: '🌎 Regional LATAM variants with local slang and cultural context',
    languages: [
      { code: 'es-MX', name: 'Mexican Spanish', nativeName: 'Español (México)', region: 'Mexico', transcreation: '¡Échale ganas y crea videos chidos con IA — es gratis, neta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', provider: 'Azure Neural' },
      { code: 'pt-BR', name: 'Brazilian Portuguese', nativeName: 'Português (Brasil)', region: 'Brazil', transcreation: 'Começa a criar vídeos incríveis com IA — de graça, sem pegadinha!', literal: 'Por favor, experimente nossa ferramenta de vídeo com IA gratuitamente', provider: 'Azure Neural' },
      { code: 'es-CO', name: 'Colombian Spanish', nativeName: 'Español (Colombia)', region: 'Colombia', transcreation: '¡Empieza a crear videos bacanos con IA — gratis, parce!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', provider: 'Azure Neural' },
      { code: 'es-AR', name: 'Argentine Spanish', nativeName: 'Español (Argentina)', region: 'Argentina', transcreation: '¡Arrancá a crear videos re piolas con IA — es gratis, posta!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', provider: 'Azure Neural' },
      { code: 'es-CL', name: 'Chilean Spanish', nativeName: 'Español (Chile)', region: 'Chile', transcreation: '¡Empieza a crear videos bacanes con IA — gratis, al tiro!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', provider: 'Azure Neural' },
      { code: 'es-PE', name: 'Peruvian Spanish', nativeName: 'Español (Perú)', region: 'Peru', transcreation: '¡Empieza a crear videos chéveres con IA — es gratis, causa!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', provider: 'Azure Neural' },
    ],
  },
  european: {
    title: 'European Languages — GDPR Compliant',
    subtitle: 'Industry 4.0 content across 24 EU official languages',
    moat: '🇪🇺 Full GDPR compliance with European-hosted data processing',
    languages: [
      { code: 'de-DE', name: 'German', nativeName: 'Deutsch', region: 'Germany', transcreation: 'Leg los mit genialen Videos — kostenlos und ohne Haken!', literal: 'Beginnen Sie mit der Erstellung hervorragender Videoinhalte', provider: 'Azure Neural' },
      { code: 'fr-FR', name: 'French', nativeName: 'Français', region: 'France', transcreation: 'Lancez-vous dans la création vidéo — c\'est gratuit et sans engagement !', literal: 'Commencez à créer d\'excellents contenus vidéo', provider: 'Azure Neural' },
      { code: 'es-ES', name: 'Spanish', nativeName: 'Español', region: 'Spain', transcreation: '¡Empieza a crear vídeos increíbles — gratis y sin compromiso!', literal: 'Comience a crear contenido de video excelente', provider: 'Azure Neural' },
      { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', region: 'Italy', transcreation: 'Inizia a creare video fantastici — è gratis, senza impegno!', literal: 'Inizia a creare contenuti video eccellenti', provider: 'Azure Neural' },
      { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', region: 'Netherlands', transcreation: 'Begin met het maken van geweldige video\'s — gratis en vrijblijvend!', literal: 'Begin met het maken van uitstekende video-inhoud', provider: 'Azure Neural' },
      { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', region: 'Poland', transcreation: 'Zacznij tworzyć genialne filmy z AI — za darmo, bez zobowiązań!', literal: 'Proszę bezpłatnie wypróbować nasze narzędzie do tworzenia wideo AI', provider: 'Azure Neural' },
      { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', region: 'Sweden', transcreation: 'Börja skapa fantastiska videor med AI — gratis, inga krångel!', literal: 'Vänligen prova vårt AI-videoverktyg gratis', provider: 'Azure Neural' },
      { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', region: 'Portugal', transcreation: 'Começa a criar vídeos espetaculares com IA — grátis e sem compromisso!', literal: 'Por favor, experimente a nossa ferramenta de criação de vídeo com IA gratuitamente', provider: 'Azure Neural' },
    ],
  },
};

// ============================================
// COMPONENT
// ============================================

interface ExpandedLanguageDemoProps {
  initialTab?: TabId;
  className?: string;
}

export const ExpandedLanguageDemo: React.FC<ExpandedLanguageDemoProps> = ({
  initialTab = 'arabic',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [showTranscreation, setShowTranscreation] = useState(true);

  const tabData = LANGUAGE_DATA[activeTab];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Stats bar */}
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">70+</p>
          <p className="text-muted-foreground text-sm">Core Languages</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">140+</p>
          <p className="text-muted-foreground text-sm">Extended</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-4xl font-bold text-accent">249+</p>
          <p className="text-muted-foreground text-sm">Translation</p>
        </div>
      </div>

      {/* Tab navigation — 2 rows on mobile */}
      <div className="flex flex-wrap justify-center gap-2">
        {LANGUAGE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 rounded-full text-sm transition ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Transcreation toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-full">
          <button
            onClick={() => setShowTranscreation(false)}
            className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
              !showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
            }`}
          >
            <X className="h-4 w-4" /> Literal Translation
          </button>
          <button
            onClick={() => setShowTranscreation(true)}
            className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
              showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Check className="h-4 w-4" /> Genie Transcreation
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="text-2xl font-bold text-foreground">{tabData.title}</h3>
          <p className="text-muted-foreground mt-1">{tabData.subtitle}</p>
        </div>

        {/* Language comparison grid */}
        <div className="divide-y divide-border">
          {tabData.languages.map((lang) => (
            <div key={lang.code} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{lang.nativeName}</span>
                  <span className="text-muted-foreground text-sm">({lang.name})</span>
                  <Badge variant="outline" className="text-[10px]">{lang.region}</Badge>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  <Volume2 className="h-3 w-3 mr-1" />
                  {lang.provider}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${showTranscreation ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'}`}>
                  <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                    ✓ Transcreated
                  </p>
                  <p className={`text-sm text-foreground ${activeTab === 'arabic' ? 'text-right' : ''}`} dir={activeTab === 'arabic' ? 'rtl' : 'ltr'}>
                    {lang.transcreation}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${!showTranscreation ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
                  <p className="text-[10px] font-medium text-red-500 uppercase mb-1">
                    ✗ Literal Translation
                  </p>
                  <p className={`text-sm text-muted-foreground ${!showTranscreation ? '' : 'line-through'} ${activeTab === 'arabic' ? 'text-right' : ''}`} dir={activeTab === 'arabic' ? 'rtl' : 'ltr'}>
                    {lang.literal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Moat callout */}
        <div className="p-4 bg-primary/5 border-t border-border text-center">
          <p className="text-primary font-semibold text-sm">{tabData.moat}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpandedLanguageDemo;
