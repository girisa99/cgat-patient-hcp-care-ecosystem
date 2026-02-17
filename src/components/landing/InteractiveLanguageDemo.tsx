/**
 * INTERACTIVE LANGUAGE DEMO
 * Full interactive demo with TTS, animation, and transcreation comparison
 */
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Pause, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Arabic dialect data
const ARABIC_DIALECTS = [
  { code: 'ar-SA', name: 'Saudi', region: 'Saudi Arabia', azureVoice: 'ar-SA-HamedNeural', example: 'ابدأ تسوي فيديوهات روعة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-EG', name: 'Egyptian', region: 'Egypt', azureVoice: 'ar-EG-ShakirNeural', example: 'ابدأ اعمل فيديوهات جامدة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-AE', name: 'Gulf', region: 'UAE/Gulf', azureVoice: 'ar-AE-HamdanNeural', example: 'ابدا سوّي فيديوهات حلوة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-LB', name: 'Levantine', region: 'Lebanon/Syria', azureVoice: 'ar-LB-LaylaNeural', example: 'بلّش اعمل فيديوهات كتير حلوة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-MA', name: 'Maghrebi', region: 'Morocco', azureVoice: 'ar-MA-JamalNeural', example: 'بدا دير فيديوهات زوينين', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-IQ', name: 'Iraqi', region: 'Iraq', azureVoice: 'ar-IQ-BasselNeural', example: 'ابدي سوّي فيديوهات روعة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-MSA', name: 'MSA', region: 'Formal/News', azureVoice: 'ar-SA-ZariyahNeural', example: 'ابدأ بإنشاء مقاطع فيديو رائعة', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
];

// Indian language data
const INDIAN_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi', region: 'North India', azureVoice: 'hi-IN-MadhurNeural', transcreation: 'AI course creator free में try करो! एकदम मस्त है!', literal: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं' },
  { code: 'bn-IN', name: 'Bengali', region: 'West Bengal', azureVoice: 'bn-IN-BashkarNeural', transcreation: 'AI course creator free-তে try করো! একদম ঝাক্কাস!', literal: 'অনুগ্রহ করে আমাদের AI-চালিত কোর্স নির্মাতা বিনামূল্যে চেষ্টা করুন' },
  { code: 'te-IN', name: 'Telugu', region: 'Andhra/Telangana', azureVoice: 'te-IN-ShrutiNeural', transcreation: 'AI course creator free-గా try చెయ్యి! చాలా బాగుంది!', literal: 'దయచేసి మా AI-ఆధారిత కోర్సు సృష్టికర్తను ఉచితంగా ప్రయత్నించండి' },
  { code: 'ta-IN', name: 'Tamil', region: 'Tamil Nadu', azureVoice: 'ta-IN-ValluvarNeural', transcreation: 'AI course creator free-ஆ try பண்ணு! சூப்பரா இருக்கு!', literal: 'எங்கள் AI-இயக்கப்படும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்' },
  { code: 'mr-IN', name: 'Marathi', region: 'Maharashtra', azureVoice: 'mr-IN-AarohiNeural', transcreation: 'AI course creator free मध्ये try करा! एकदम भारी आहे!', literal: 'कृपया आमचे AI-संचालित कोर्स निर्माता विनामूल्य वापरून पहा' },
  { code: 'gu-IN', name: 'Gujarati', region: 'Gujarat', azureVoice: 'gu-IN-DhwaniNeural', transcreation: 'AI course creator free માં try કરો! એકદમ મસ્ત છે!', literal: 'કૃપા કરીને અમારા AI-સંચાલિત કોર્સ નિર્માતાને મફતમાં અજમાવો' },
  { code: 'kn-IN', name: 'Kannada', region: 'Karnataka', azureVoice: 'kn-IN-GaganNeural', transcreation: 'AI course creator free ಆಗಿ try ಮಾಡಿ! ಸೂಪರ್ ಇದೆ!', literal: 'ದಯವಿಟ್ಟು ನಮ್ಮ AI-ಚಾಲಿತ ಕೋರ್ಸ್ ಸೃಷ್ಟಿಕರ್ತವನ್ನು ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ' },
  { code: 'ml-IN', name: 'Malayalam', region: 'Kerala', azureVoice: 'ml-IN-SobhanaNeural', transcreation: 'AI course creator free ആയി try ചെയ്യൂ! കിടുക്കാച്ചി!', literal: 'ദയവായി ഞങ്ങളുടെ AI-പവർഡ് കോഴ്സ് ക്രിയേറ്റർ സൗജന്യമായി പരീക്ഷിക്കുക' },
];

// African language data
const AFRICAN_LANGUAGES = [
  { code: 'sw-KE', name: 'Swahili', region: 'Kenya/Tanzania', azureVoice: 'sw-KE-RafikiNeural', example: 'Anza kuunda video za kushangaza!' },
  { code: 'yo-NG', name: 'Yoruba', region: 'Nigeria', azureVoice: 'yo-NG-AbiodunNeural', example: 'Bẹ̀rẹ̀ ṣíṣe fidio to dára!' },
  { code: 'ha-NG', name: 'Hausa', region: 'Nigeria', azureVoice: 'ha-NG-AbubakarNeural', example: 'Fara yin bidiyo mai kyau!' },
  { code: 'zu-ZA', name: 'Zulu', region: 'South Africa', azureVoice: 'zu-ZA-ThandoNeural', example: 'Qala ukwenza amavidiyo amahle!' },
  { code: 'am-ET', name: 'Amharic', region: 'Ethiopia', azureVoice: 'am-ET-MekdesNeural', example: 'አስደናቂ ቪዲዮዎችን መፍጠር ጀምር!' },
  { code: 'ig-NG', name: 'Igbo', region: 'Nigeria', azureVoice: 'ig-NG-EzinneNeural', example: 'Malite ịmepụta vidiyo dị mma!' },
  { code: 'xh-ZA', name: 'Xhosa', region: 'South Africa', azureVoice: 'xh-ZA-ThembaNeural', example: 'Qala ukwenza iividiyo ezintle!' },
  { code: 'af-ZA', name: 'Afrikaans', region: 'South Africa', azureVoice: 'af-ZA-AdriNeural', example: 'Begin om wonderlike videos te maak!' },
  { code: 'rw-RW', name: 'Kinyarwanda', region: 'Rwanda', azureVoice: 'rw-RW-JeanNeural', example: 'Tangira gukora amashusho meza!' },
  { code: 'so-SO', name: 'Somali', region: 'Somalia', azureVoice: 'so-SO-MuuseNeural', example: 'Bilow samaynta fiidiyooyinka cajiibka ah!' },
];

type LanguageTab = 'arabic' | 'indian' | 'african';

interface InteractiveLanguageDemoProps {
  initialTab?: LanguageTab;
}

export const InteractiveLanguageDemo: React.FC<InteractiveLanguageDemoProps> = ({ 
  initialTab = 'arabic' 
}) => {
  const [activeTab, setActiveTab] = useState<LanguageTab>(initialTab);
  const [selectedDialect, setSelectedDialect] = useState(ARABIC_DIALECTS[0]);
  const [selectedIndian, setSelectedIndian] = useState(INDIAN_LANGUAGES[0]);
  const [selectedAfrican, setSelectedAfrican] = useState(AFRICAN_LANGUAGES[0]);
  const [showTranscreation, setShowTranscreation] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customText, setCustomText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = async (text: string, voiceId: string, languageCode: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setIsPlaying(true);

    try {
      // Use the existing text-to-speech edge function (hardcoded, no VITE_ env vars in Lovable)
      const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            text,
            voice: 'alloy', // OpenAI voice
            model: 'tts-1',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const data = await response.json();
      
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play new audio
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      await audioRef.current.play();
      
      toast.success(`Playing ${languageCode} audio`);
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Audio demo currently unavailable');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const renderArabicDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 text-foreground">
          Same Message, 7 Different Dialects
        </h3>
        <p className="text-muted-foreground">
          "Start creating amazing videos today!" — naturally localized
        </p>
      </div>

      {/* Dialect selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {ARABIC_DIALECTS.map((dialect) => (
          <button
            key={dialect.code}
            onClick={() => setSelectedDialect(dialect)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedDialect.code === dialect.code
                ? 'bg-primary text-primary-foreground scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {dialect.name}
          </button>
        ))}
      </div>

      {/* Selected dialect display */}
      <div className="bg-muted/50 rounded-2xl p-6 border border-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-primary font-bold text-lg">{selectedDialect.name}</span>
            <span className="text-muted-foreground ml-2">({selectedDialect.region})</span>
          </div>
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            onClick={() => isPlaying ? stopAudio() : playTTS(selectedDialect.example, selectedDialect.azureVoice, selectedDialect.code)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Volume2 className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Stop' : 'Play Audio'}
          </Button>
        </div>
        
        <p className="text-3xl text-right text-foreground font-arabic leading-relaxed" dir="rtl">
          {selectedDialect.example}
        </p>

        {selectedDialect.code !== 'ar-MSA' && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Compared to MSA (Formal):</p>
            <p className="text-lg text-right text-muted-foreground" dir="rtl">
              {selectedDialect.literal}
            </p>
          </div>
        )}
      </div>

      {/* Competitive advantage */}
      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30 text-center">
        <p className="text-green-600 dark:text-green-400">
          ⭐ <strong>NO competitor offers all 7 Arabic dialects</strong> — this is our exclusive moat!
        </p>
      </div>
    </div>
  );

  const renderIndianDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 text-foreground">
          22 Indian Languages + Code-Mixing
        </h3>
        <p className="text-muted-foreground">
          See the difference between robotic translation and natural speech
        </p>
      </div>

      {/* Transcreation toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-full">
          <button
            onClick={() => setShowTranscreation(false)}
            className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
              !showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
            }`}
          >
            <X className="h-4 w-4" /> Literal Translation
          </button>
          <button
            onClick={() => setShowTranscreation(true)}
            className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
              showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Check className="h-4 w-4" /> Genie Transcreation
          </button>
        </div>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {INDIAN_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedIndian(lang)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedIndian.code === lang.code
                ? 'bg-primary text-primary-foreground scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Comparison display */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-xl transition-all ${
          !showTranscreation 
            ? 'bg-destructive/10 border-2 border-destructive/50 scale-105' 
            : 'bg-muted/50 border border-border'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground font-medium">Literal (Robotic)</span>
            {!showTranscreation && <Badge variant="destructive">Active</Badge>}
          </div>
          <p className="text-xl text-foreground leading-relaxed">{selectedIndian.literal}</p>
          <p className="text-destructive text-sm mt-3 flex items-center gap-1">
            <X className="h-4 w-4" /> Textbook style. Nobody talks like this.
          </p>
        </div>

        <div className={`p-6 rounded-xl transition-all ${
          showTranscreation 
            ? 'bg-green-500/10 border-2 border-green-500/50 scale-105' 
            : 'bg-muted/50 border border-border'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground font-medium">Transcreation (Natural)</span>
            {showTranscreation && <Badge className="bg-green-500">Active</Badge>}
          </div>
          <p className="text-xl text-foreground leading-relaxed">{selectedIndian.transcreation}</p>
          <p className="text-green-600 dark:text-green-400 text-sm mt-3 flex items-center gap-1">
            <Check className="h-4 w-4" /> Natural urban speech with English terms
          </p>
          {showTranscreation && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => playTTS(selectedIndian.transcreation, selectedIndian.azureVoice, selectedIndian.code)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
              Hear It
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderAfricanDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 text-foreground">
          10 African Languages — First Mover Advantage
        </h3>
        <p className="text-muted-foreground">
          Reaching 500M+ users in their native languages
        </p>
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {AFRICAN_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedAfrican(lang)}
            className={`p-4 rounded-xl transition-all text-center ${
              selectedAfrican.code === lang.code
                ? 'bg-primary text-primary-foreground scale-105 shadow-lg'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <span className="font-bold">{lang.name}</span>
            <span className="block text-xs opacity-70 mt-1">{lang.region}</span>
          </button>
        ))}
      </div>

      {/* Selected language display */}
      <div className="bg-muted/50 rounded-2xl p-6 border border-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-primary font-bold text-lg">{selectedAfrican.name}</span>
            <span className="text-muted-foreground ml-2">({selectedAfrican.region})</span>
          </div>
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            onClick={() => isPlaying ? stopAudio() : playTTS(selectedAfrican.example, selectedAfrican.azureVoice, selectedAfrican.code)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Volume2 className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Stop' : 'Play Audio'}
          </Button>
        </div>
        
        <p className="text-2xl text-foreground leading-relaxed">
          {selectedAfrican.example}
        </p>
      </div>

      {/* First mover advantage */}
      <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-center">
        <p className="text-yellow-600 dark:text-yellow-400">
          🌍 <strong>First mover in African language AI content</strong> — 500M+ potential users
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex justify-center gap-8">
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

      {/* Tab navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'arabic' as const, label: '🇸🇦 7 Arabic Dialects', badge: 'Exclusive' },
          { id: 'indian' as const, label: '🇮🇳 22 Indian Languages', badge: 'Most complete' },
          { id: 'african' as const, label: '🌍 10 African Languages', badge: 'First mover' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 rounded-full transition ${
              activeTab === tab.id
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

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
        {activeTab === 'arabic' && renderArabicDemo()}
        {activeTab === 'indian' && renderIndianDemo()}
        {activeTab === 'african' && renderAfricanDemo()}
      </div>
    </div>
  );
};

export default InteractiveLanguageDemo;
