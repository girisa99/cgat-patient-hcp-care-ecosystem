 /**
  * Regional Dialect Selector Component
  * Provides granular sub-region and dialect selection for TTS/transcreation
  * Supports India (N/S/E/W), MENA (7 dialects), and other regional variants
  */
 
 import React, { useState, useMemo } from 'react';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Label } from '@/components/ui/label';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 import { ChevronDown, Globe, MapPin, Languages } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 export interface DialectOption {
   code: string;
   name: string;
   nativeName: string;
   ttsProvider: string;
   voiceId?: string;
 }
 
 export interface SubRegion {
   id: string;
   name: string;
   tone: string;
   dialects: DialectOption[];
 }
 
 export interface RegionConfig {
   id: string;
   name: string;
   icon: string;
   subRegions: SubRegion[];
 }
 
 // Comprehensive regional configuration
 const REGIONAL_CONFIG: RegionConfig[] = [
   {
     id: 'india',
     name: 'India',
     icon: '🇮🇳',
     subRegions: [
       {
         id: 'india-north',
         name: 'North India',
         tone: 'Direct, aspirational',
         dialects: [
           { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', ttsProvider: 'azure-neural' },
           { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'india-south',
         name: 'South India',
         tone: 'Tech-forward, respectful',
         dialects: [
           { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', ttsProvider: 'azure-neural' },
           { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', ttsProvider: 'azure-neural' },
           { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', ttsProvider: 'azure-neural' },
           { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'india-east',
         name: 'East India',
         tone: 'Literary, emotional',
         dialects: [
           { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', ttsProvider: 'azure-neural' },
           { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', ttsProvider: 'azure-neural' },
           { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'india-west',
         name: 'West India',
         tone: 'Business-savvy, pragmatic',
         dialects: [
           { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', ttsProvider: 'azure-neural' },
           { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'india-pan',
         name: 'Pan-India',
         tone: 'Universal appeal',
         dialects: [
           { code: 'hi-IN-hinglish', name: 'Hinglish', nativeName: 'हिंग्लिश', ttsProvider: 'azure-neural' },
           { code: 'en-IN', name: 'Indian English', nativeName: 'Indian English', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
   {
     id: 'mena',
     name: 'MENA (Middle East & North Africa)',
     icon: '🌍',
     subRegions: [
       {
         id: 'mena-gulf',
         name: 'Gulf States',
         tone: 'Formal, business-oriented',
         dialects: [
           { code: 'ar-SA', name: 'Saudi Arabic', nativeName: 'العربية السعودية', ttsProvider: 'azure-neural' },
           { code: 'ar-AE', name: 'Emirati Arabic', nativeName: 'العربية الإماراتية', ttsProvider: 'azure-neural' },
           { code: 'ar-QA', name: 'Qatari Arabic', nativeName: 'العربية القطرية', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'mena-levant',
         name: 'Levant',
         tone: 'Warm, conversational',
         dialects: [
           { code: 'ar-JO', name: 'Jordanian Arabic', nativeName: 'العربية الأردنية', ttsProvider: 'azure-neural' },
           { code: 'ar-LB', name: 'Lebanese Arabic', nativeName: 'العربية اللبنانية', ttsProvider: 'azure-neural' },
           { code: 'ar-SY', name: 'Syrian Arabic', nativeName: 'العربية السورية', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'mena-egypt',
         name: 'Egypt',
         tone: 'Expressive, humorous',
         dialects: [
           { code: 'ar-EG', name: 'Egyptian Arabic', nativeName: 'العربية المصرية', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'mena-maghreb',
         name: 'Maghreb (North Africa)',
         tone: 'Blend of Arabic & French influences',
         dialects: [
           { code: 'ar-MA', name: 'Moroccan Arabic', nativeName: 'الدارجة المغربية', ttsProvider: 'azure-neural' },
           { code: 'ar-DZ', name: 'Algerian Arabic', nativeName: 'الدارجة الجزائرية', ttsProvider: 'azure-neural' },
           { code: 'ar-TN', name: 'Tunisian Arabic', nativeName: 'التونسية', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'mena-iraq',
         name: 'Iraq',
         tone: 'Traditional, poetic',
         dialects: [
           { code: 'ar-IQ', name: 'Iraqi Arabic', nativeName: 'العربية العراقية', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'mena-msa',
         name: 'Modern Standard Arabic',
         tone: 'Formal, universal',
         dialects: [
           { code: 'ar', name: 'MSA (Fus\'ha)', nativeName: 'الفصحى', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
   {
     id: 'cjk',
     name: 'CJK (China, Japan, Korea)',
     icon: '🏯',
     subRegions: [
       {
         id: 'cjk-china',
         name: 'China',
         tone: 'Pragmatic, aspirational',
         dialects: [
           { code: 'zh-CN', name: 'Mandarin (Simplified)', nativeName: '普通话', ttsProvider: 'alibaba-cosyvoice' },
           { code: 'zh-TW', name: 'Mandarin (Traditional)', nativeName: '國語', ttsProvider: 'alibaba-cosyvoice' },
           { code: 'yue-CN', name: 'Cantonese', nativeName: '粵語', ttsProvider: 'alibaba-cosyvoice' },
         ],
       },
       {
         id: 'cjk-japan',
         name: 'Japan',
         tone: 'Polite, minimalist (Muji aesthetic)',
         dialects: [
           { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', ttsProvider: 'alibaba-cosyvoice' },
         ],
       },
       {
         id: 'cjk-korea',
         name: 'Korea',
         tone: 'Trend-forward, K-culture',
         dialects: [
           { code: 'ko-KR', name: 'Korean', nativeName: '한국어', ttsProvider: 'alibaba-cosyvoice' },
         ],
       },
     ],
   },
   {
     id: 'europe',
     name: 'Europe',
     icon: '🇪🇺',
     subRegions: [
       {
         id: 'europe-western',
         name: 'Western Europe',
         tone: 'Sophisticated, quality-focused',
         dialects: [
           { code: 'de-DE', name: 'German', nativeName: 'Deutsch', ttsProvider: 'azure-neural' },
           { code: 'fr-FR', name: 'French', nativeName: 'Français', ttsProvider: 'azure-neural' },
           { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'europe-southern',
         name: 'Southern Europe',
         tone: 'Warm, lifestyle-oriented',
         dialects: [
           { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', ttsProvider: 'azure-neural' },
           { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', ttsProvider: 'azure-neural' },
           { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'europe-nordic',
         name: 'Nordic',
         tone: 'Minimalist, sustainable',
         dialects: [
           { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', ttsProvider: 'azure-neural' },
           { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', ttsProvider: 'azure-neural' },
           { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', ttsProvider: 'azure-neural' },
           { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
   {
     id: 'latam',
     name: 'Latin America',
     icon: '🌎',
     subRegions: [
       {
         id: 'latam-mexico',
         name: 'Mexico & Central America',
         tone: 'Vibrant, family-oriented',
         dialects: [
           { code: 'es-MX', name: 'Mexican Spanish', nativeName: 'Español Mexicano', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'latam-south',
         name: 'South America',
         tone: 'Passionate, diverse',
         dialects: [
           { code: 'es-AR', name: 'Argentine Spanish', nativeName: 'Español Argentino', ttsProvider: 'azure-neural' },
           { code: 'es-CO', name: 'Colombian Spanish', nativeName: 'Español Colombiano', ttsProvider: 'azure-neural' },
           { code: 'pt-BR', name: 'Brazilian Portuguese', nativeName: 'Português Brasileiro', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
   {
     id: 'sea',
     name: 'Southeast Asia',
     icon: '🌏',
     subRegions: [
       {
         id: 'sea-mainland',
         name: 'Mainland SEA',
         tone: 'Respectful, community-focused',
         dialects: [
           { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', ttsProvider: 'azure-neural' },
           { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'sea-maritime',
         name: 'Maritime SEA',
         tone: 'Diverse, multicultural',
         dialects: [
           { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', ttsProvider: 'azure-neural' },
           { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', ttsProvider: 'azure-neural' },
           { code: 'tl-PH', name: 'Filipino/Tagalog', nativeName: 'Tagalog', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
   {
     id: 'africa',
     name: 'Africa',
     icon: '🌍',
     subRegions: [
       {
         id: 'africa-east',
         name: 'East Africa',
         tone: 'Community-driven, mobile-first',
         dialects: [
           { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', ttsProvider: 'azure-neural' },
           { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'africa-west',
         name: 'West Africa',
         tone: 'Entrepreneurial, vibrant',
         dialects: [
           { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', ttsProvider: 'azure-neural' },
           { code: 'ha-NG', name: 'Hausa', nativeName: 'Hausa', ttsProvider: 'azure-neural' },
           { code: 'en-NG', name: 'Nigerian English', nativeName: 'Nigerian English', ttsProvider: 'azure-neural' },
         ],
       },
       {
         id: 'africa-south',
         name: 'Southern Africa',
         tone: 'Diverse, multilingual',
         dialects: [
           { code: 'en-ZA', name: 'South African English', nativeName: 'SA English', ttsProvider: 'azure-neural' },
           { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', ttsProvider: 'azure-neural' },
           { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', ttsProvider: 'azure-neural' },
         ],
       },
     ],
   },
 ];
 
 interface RegionalDialectSelectorProps {
   selectedDialects: string[];
   onDialectsChange: (dialects: string[]) => void;
   selectedRegions?: string[];
   onRegionsChange?: (regions: string[]) => void;
   compact?: boolean;
   maxHeight?: string;
 }
 
 export const RegionalDialectSelector: React.FC<RegionalDialectSelectorProps> = ({
   selectedDialects,
   onDialectsChange,
   selectedRegions = [],
   onRegionsChange,
   compact = false,
   maxHeight = '400px',
 }) => {
   const [expandedRegions, setExpandedRegions] = useState<string[]>(['india', 'mena']);
 
   const toggleRegion = (regionId: string) => {
     setExpandedRegions(prev =>
       prev.includes(regionId)
         ? prev.filter(r => r !== regionId)
         : [...prev, regionId]
     );
   };
 
   const toggleDialect = (dialectCode: string) => {
     const newDialects = selectedDialects.includes(dialectCode)
       ? selectedDialects.filter(d => d !== dialectCode)
       : [...selectedDialects, dialectCode];
     onDialectsChange(newDialects);
   };
 
   const selectAllInSubRegion = (subRegion: SubRegion) => {
     const subRegionCodes = subRegion.dialects.map(d => d.code);
     const allSelected = subRegionCodes.every(code => selectedDialects.includes(code));
     
     if (allSelected) {
       onDialectsChange(selectedDialects.filter(d => !subRegionCodes.includes(d)));
     } else {
       const newDialects = [...new Set([...selectedDialects, ...subRegionCodes])];
       onDialectsChange(newDialects);
     }
   };
 
   const selectedCount = useMemo(() => selectedDialects.length, [selectedDialects]);
 
   return (
     <div className="space-y-2">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Languages className="h-4 w-4 text-muted-foreground" />
           <Label className="text-sm font-medium">Regional Dialects</Label>
         </div>
         {selectedCount > 0 && (
           <Badge variant="secondary" className="text-xs">
             {selectedCount} selected
           </Badge>
         )}
       </div>
 
       <ScrollArea style={{ maxHeight }} className="border rounded-lg">
         <div className="p-2 space-y-1">
           {REGIONAL_CONFIG.map(region => (
             <Collapsible
               key={region.id}
               open={expandedRegions.includes(region.id)}
               onOpenChange={() => toggleRegion(region.id)}
             >
               <CollapsibleTrigger asChild>
                 <Button
                   variant="ghost"
                   className="w-full justify-between h-9 px-2"
                 >
                   <div className="flex items-center gap-2">
                     <span>{region.icon}</span>
                     <span className="font-medium text-sm">{region.name}</span>
                   </div>
                   <ChevronDown
                     className={cn(
                       "h-4 w-4 transition-transform",
                       expandedRegions.includes(region.id) && "rotate-180"
                     )}
                   />
                 </Button>
               </CollapsibleTrigger>
               
               <CollapsibleContent className="pl-4 space-y-1">
                 {region.subRegions.map(subRegion => (
                   <div key={subRegion.id} className="border-l-2 border-muted pl-3 py-1">
                     <div className="flex items-center justify-between mb-1">
                       <div className="flex items-center gap-2">
                         <MapPin className="h-3 w-3 text-muted-foreground" />
                         <span className="text-xs font-medium">{subRegion.name}</span>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 text-xs"
                         onClick={() => selectAllInSubRegion(subRegion)}
                       >
                         {subRegion.dialects.every(d => selectedDialects.includes(d.code))
                           ? 'Deselect All'
                           : 'Select All'}
                       </Button>
                     </div>
                     
                     <p className="text-[10px] text-muted-foreground mb-2 italic">
                       Tone: {subRegion.tone}
                     </p>
                     
                     <div className={cn("grid gap-1", compact ? "grid-cols-1" : "grid-cols-2")}>
                       {subRegion.dialects.map(dialect => (
                         <div
                           key={dialect.code}
                           className={cn(
                             "flex items-center gap-2 p-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                             selectedDialects.includes(dialect.code) && "bg-primary/10"
                           )}
                           onClick={() => toggleDialect(dialect.code)}
                         >
                           <Checkbox
                             checked={selectedDialects.includes(dialect.code)}
                             onCheckedChange={() => toggleDialect(dialect.code)}
                             className="h-3 w-3"
                           />
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-1">
                               <span className="text-xs font-medium truncate">{dialect.name}</span>
                               <span className="text-[10px] text-muted-foreground">
                                 ({dialect.nativeName})
                               </span>
                             </div>
                             <span className="text-[9px] text-muted-foreground">
                               TTS: {dialect.ttsProvider}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </CollapsibleContent>
             </Collapsible>
           ))}
         </div>
       </ScrollArea>
 
       {selectedDialects.length > 0 && (
         <div className="flex flex-wrap gap-1 pt-2">
           {selectedDialects.slice(0, 5).map(code => {
             const dialect = REGIONAL_CONFIG
               .flatMap(r => r.subRegions)
               .flatMap(sr => sr.dialects)
               .find(d => d.code === code);
             return dialect ? (
               <Badge key={code} variant="outline" className="text-[10px]">
                 {dialect.name}
               </Badge>
             ) : null;
           })}
           {selectedDialects.length > 5 && (
             <Badge variant="secondary" className="text-[10px]">
               +{selectedDialects.length - 5} more
             </Badge>
           )}
         </div>
       )}
     </div>
   );
 };
 
 export { REGIONAL_CONFIG };
 export default RegionalDialectSelector;