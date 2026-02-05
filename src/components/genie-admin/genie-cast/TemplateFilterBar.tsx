 /**
  * TEMPLATE FILTER BAR
  * Smart collapsible filter chips for navigating 407+ templates
  * 
  * Filters: Category, Combination, Device/Platform, Region, Capability, Industry
  */
 
 import React, { useState, useMemo } from 'react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Input } from '@/components/ui/input';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Separator } from '@/components/ui/separator';
 import {
   Search,
   X,
   ChevronDown,
   Check,
   Filter,
   Layers,
   Globe2,
   Cpu,
   Building2,
   Smartphone,
   Box,
   RotateCcw,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 // ============================================
 // FILTER DEFINITIONS
 // ============================================
 
 // Category filters (replace tabs)
 export const CATEGORY_FILTERS = [
   { value: 'all', label: 'All Categories', icon: '📁' },
   { value: 'marketing', label: 'Marketing', icon: '🎯' },
   { value: 'educational', label: 'Educational', icon: '📚' },
   { value: 'storytelling', label: 'Storytelling', icon: '🎬' },
   { value: 'announcement', label: 'Announcements', icon: '📢' },
   { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
   { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
   { value: 'corporate', label: 'Corporate', icon: '🏢' },
   { value: 'animation', label: 'Animation', icon: '🎨' },
   { value: '3d', label: '3D & VR/AR', icon: '🧊' },
   { value: 'interactive', label: 'Interactive', icon: '👆' },
   { value: 'image_to_video', label: 'Image-to-Video', icon: '🖼️' },
   { value: 'seasonal', label: 'Seasonal', icon: '🎄' },
   { value: 'travel', label: 'Travel', icon: '✈️' },
   { value: 'avatar', label: 'Avatar', icon: '👤' },
   { value: 'ppt', label: 'PPT/Slides', icon: '📊' },
   { value: 'smb', label: 'Small Business', icon: '🏪' },
   { value: 'oil_gas', label: 'Oil & Gas', icon: '⛽' },
   { value: 'combination', label: 'Combinations', icon: '🔗' },
   { value: 'heritage', label: 'Heritage', icon: '🏛️' },
   { value: 'vision', label: 'Vision Projects', icon: '🌟' },
 ];
 
 // NEW: Combination filters (multi-modal templates)
 export const COMBINATION_FILTERS = [
   { value: 'all', label: 'All Types', icon: '🔗' },
   { value: 'avatar_ppt', label: 'Avatar + PPT/Slides', icon: '👤📊', keywords: ['avatar', 'ppt', 'slides', 'presentation'] },
   { value: 'avatar_3d', label: 'Avatar + 3D', icon: '👤🧊', keywords: ['avatar', '3d', 'product'] },
   { value: 'avatar_video', label: 'Avatar + Video', icon: '👤🎬', keywords: ['avatar', 'video', 'talking head'] },
   { value: 'vr_avatar_3d', label: 'VR + Avatar + 3D', icon: '🥽👤🧊', keywords: ['vr', 'avatar', '3d', 'immersive'] },
   { value: '3d_video', label: '3D + Video', icon: '🧊🎬', keywords: ['3d', 'video', 'animation'] },
   { value: 'animation_tts', label: 'Animation + TTS', icon: '🎨🎙️', keywords: ['animation', 'tts', 'voiceover'] },
   { value: 'video_music', label: 'Video + Music', icon: '🎬🎵', keywords: ['video', 'music', 'audio'] },
   { value: 'lipsync_avatar', label: 'Lipsync + Avatar', icon: '👄👤', keywords: ['lipsync', 'avatar', 'speaking'] },
   { value: 'full_production', label: 'Full Production', icon: '🎬✨', keywords: ['full', 'production', 'multi'] },
 ];
 
 // NEW: Device/Platform filters
 export const DEVICE_FILTERS = [
   { value: 'all', label: 'All Formats', icon: '📱' },
   { value: 'mobile_9_16', label: 'Mobile (9:16)', icon: '📱', keywords: ['mobile', '9:16', 'vertical', 'tiktok', 'reels', 'shorts'] },
   { value: 'desktop_16_9', label: 'Desktop (16:9)', icon: '🖥️', keywords: ['desktop', '16:9', 'horizontal', 'youtube', 'website'] },
   { value: 'social_1_1', label: 'Social Square (1:1)', icon: '⬜', keywords: ['square', '1:1', 'instagram', 'feed'] },
   { value: 'social_4_5', label: 'Social Feed (4:5)', icon: '📲', keywords: ['feed', '4:5', 'instagram', 'facebook'] },
   { value: 'vr_ar', label: 'VR/AR Immersive', icon: '🥽', keywords: ['vr', 'ar', 'immersive', '360'] },
   { value: 'presentation', label: 'Presentation (16:9)', icon: '📊', keywords: ['ppt', 'slides', 'presentation', 'deck'] },
   { value: 'kiosk', label: 'Kiosk/Signage', icon: '🖼️', keywords: ['kiosk', 'signage', 'display', 'vertical'] },
 ];
 
 // Regional filters
 export const REGION_FILTERS = [
   { value: 'all', label: 'All Regions', icon: '🌍' },
   { value: 'western', label: 'Western/US', icon: '🇺🇸', keywords: ['western', 'us', 'american', 'english'] },
   { value: 'europe', label: 'Europe', icon: '🇪🇺', keywords: ['europe', 'european', 'german', 'french', 'italian'] },
   { value: 'cjk', label: 'CJK', icon: '🇨🇳', keywords: ['cjk', 'china', 'japan', 'korea', 'chinese', 'japanese', 'korean', 'anime'] },
   { value: 'india', label: 'India', icon: '🇮🇳', keywords: ['india', 'indian', 'hindi', 'bollywood', 'telugu', 'tamil'] },
   { value: 'mena', label: 'MENA', icon: '🇸🇦', keywords: ['mena', 'arabic', 'arab', 'middle east', 'rtl'] },
   { value: 'sea', label: 'Southeast Asia', icon: '🇸🇬', keywords: ['sea', 'southeast asia', 'thailand', 'vietnam', 'indonesia'] },
   { value: 'africa', label: 'Africa', icon: '🌍', keywords: ['africa', 'african', 'nigeria'] },
   { value: 'latam', label: 'Latin America', icon: '🇧🇷', keywords: ['latam', 'latin america', 'spanish', 'portuguese', 'brazil'] },
   { value: 'caribbean', label: 'Caribbean', icon: '🏝️', keywords: ['caribbean', 'tropical', 'island'] },
   { value: 'pakistan', label: 'Pakistan', icon: '🇵🇰', keywords: ['pakistan', 'urdu', 'pakistani'] },
 ];
 
 // Capability filters
 export const CAPABILITY_FILTERS = [
   { value: 'all', label: 'All Capabilities', icon: '⚡' },
   { value: 'text_to_video', label: 'Text-to-Video', icon: '📹', keywords: ['video', 'text-to-video'] },
   { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️', keywords: ['image-to-video', 'i2v'] },
   { value: '3d_generation', label: '3D Generation', icon: '🧊', keywords: ['3d', 'mesh', 'model'] },
   { value: 'avatar', label: 'Avatar', icon: '👤', keywords: ['avatar', 'talking head'] },
   { value: 'full_body_avatar', label: 'Full Body Avatar', icon: '🧍', keywords: ['full body', 'presenter'] },
   { value: 'lipsync', label: 'Lipsync', icon: '👄', keywords: ['lipsync', 'lip sync'] },
   { value: 'tts', label: 'TTS Voiceover', icon: '🎙️', keywords: ['tts', 'voiceover', 'speech'] },
   { value: 'music_gen', label: 'Music Generation', icon: '🎵', keywords: ['music', 'audio'] },
   { value: 'video_effects', label: 'Video Effects', icon: '✨', keywords: ['effects', 'transitions'] },
   { value: 'pixar_style', label: 'Pixar Style', icon: '🎨', keywords: ['pixar', '3d animation'] },
   { value: 'anime_style', label: 'Anime Style', icon: '🎌', keywords: ['anime', 'japanese'] },
   { value: 'motion_control', label: 'Motion Control', icon: '🎯', keywords: ['motion', 'camera'] },
 ];
 
 // Industry filters
 export const INDUSTRY_FILTERS = [
   { value: 'all', label: 'All Industries', icon: '🏢' },
   { value: 'saas', label: 'SaaS/Tech', icon: '💻' },
   { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
   { value: 'travel', label: 'Travel/Tourism', icon: '✈️' },
   { value: 'finance', label: 'Finance/Banking', icon: '💰' },
   { value: 'retail', label: 'Retail/E-commerce', icon: '🛍️' },
   { value: 'education', label: 'Education', icon: '📚' },
   { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
   { value: 'consulting', label: 'Consulting', icon: '📊' },
   { value: 'restaurants', label: 'Restaurants', icon: '🍽️' },
   { value: 'smb', label: 'Small Business', icon: '🏪' },
   { value: 'oil_gas', label: 'Oil & Gas', icon: '⛽' },
   { value: 'ppt', label: 'PPT/Slides', icon: '📊' },
 ];
 
 // ============================================
 // TYPES
 // ============================================
 
 export interface FilterState {
   search: string;
   category: string;
   combination: string;
   device: string;
   region: string;
   capability: string;
   industry: string;
 }
 
 interface FilterChipProps {
   label: string;
   icon: React.ReactNode;
   options: { value: string; label: string; icon?: string }[];
   value: string;
   onChange: (value: string) => void;
   activeCount?: number;
 }
 
 // ============================================
 // FILTER CHIP COMPONENT
 // ============================================
 
 const FilterChip: React.FC<FilterChipProps> = ({
   label,
   icon,
   options,
   value,
   onChange,
   activeCount,
 }) => {
   const [isOpen, setIsOpen] = useState(false);
   const selectedOption = options.find(o => o.value === value);
   const isActive = value !== 'all';
 
   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <Button
           variant={isActive ? "default" : "outline"}
           size="sm"
           className={cn(
             "h-8 gap-1.5 text-xs font-medium transition-all",
             isActive && "bg-primary text-primary-foreground shadow-sm"
           )}
         >
           {icon}
           <span className="hidden sm:inline">{label}:</span>
           <span className="font-semibold">
             {selectedOption?.icon && <span className="mr-1">{selectedOption.icon}</span>}
             {selectedOption?.label || 'All'}
           </span>
           {activeCount !== undefined && activeCount > 0 && (
             <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
               {activeCount}
             </Badge>
           )}
           <ChevronDown className="h-3 w-3 opacity-50" />
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-56 p-0" align="start">
         <ScrollArea className="h-64">
           <div className="p-1">
             {options.map((option) => (
               <button
                 key={option.value}
                 onClick={() => {
                   onChange(option.value);
                   setIsOpen(false);
                 }}
                 className={cn(
                   "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left",
                   value === option.value
                     ? "bg-primary/10 text-primary font-medium"
                     : "hover:bg-muted"
                 )}
               >
                 {option.icon && <span className="text-sm">{option.icon}</span>}
                 <span className="flex-1">{option.label}</span>
                 {value === option.value && <Check className="h-4 w-4" />}
               </button>
             ))}
           </div>
         </ScrollArea>
       </PopoverContent>
     </Popover>
   );
 };
 
 // ============================================
 // MAIN FILTER BAR COMPONENT
 // ============================================
 
 interface TemplateFilterBarProps {
   filters: FilterState;
   onFiltersChange: (filters: FilterState) => void;
   totalCount: number;
   filteredCount: number;
   onReset: () => void;
 }
 
 export const TemplateFilterBar: React.FC<TemplateFilterBarProps> = ({
   filters,
   onFiltersChange,
   totalCount,
   filteredCount,
   onReset,
 }) => {
   const activeFilterCount = useMemo(() => {
     let count = 0;
     if (filters.category !== 'all') count++;
     if (filters.combination !== 'all') count++;
     if (filters.device !== 'all') count++;
     if (filters.region !== 'all') count++;
     if (filters.capability !== 'all') count++;
     if (filters.industry !== 'all') count++;
     if (filters.search.trim()) count++;
     return count;
   }, [filters]);
 
   const updateFilter = (key: keyof FilterState, value: string) => {
     onFiltersChange({ ...filters, [key]: value });
   };
 
   return (
     <div className="space-y-3">
       {/* Search Row */}
       <div className="flex items-center gap-3">
         <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search 407 templates..."
             value={filters.search}
             onChange={(e) => updateFilter('search', e.target.value)}
             className="pl-9 h-9"
           />
           {filters.search && (
             <Button
               variant="ghost"
               size="sm"
               className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
               onClick={() => updateFilter('search', '')}
             >
               <X className="h-3 w-3" />
             </Button>
           )}
         </div>
 
         <Separator orientation="vertical" className="h-6" />
 
         {/* Filter Summary */}
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <Filter className="h-4 w-4" />
           <span>
             <span className="font-semibold text-foreground">{filteredCount}</span>
             {' '}of {totalCount} templates
           </span>
           {activeFilterCount > 0 && (
             <Badge variant="secondary" className="text-xs">
               {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
             </Badge>
           )}
         </div>
 
         {activeFilterCount > 0 && (
           <Button
             variant="ghost"
             size="sm"
             onClick={onReset}
             className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
           >
             <RotateCcw className="h-3 w-3" />
             Reset
           </Button>
         )}
       </div>
 
       {/* Filter Chips Row */}
       <div className="flex flex-wrap items-center gap-2">
         {/* Category */}
         <FilterChip
           label="Category"
           icon={<Layers className="h-3.5 w-3.5" />}
           options={CATEGORY_FILTERS}
           value={filters.category}
           onChange={(v) => updateFilter('category', v)}
         />
 
         {/* Combination - NEW */}
         <FilterChip
           label="Combination"
           icon={<Box className="h-3.5 w-3.5" />}
           options={COMBINATION_FILTERS}
           value={filters.combination}
           onChange={(v) => updateFilter('combination', v)}
         />
 
         {/* Device/Platform - NEW */}
         <FilterChip
           label="Format"
           icon={<Smartphone className="h-3.5 w-3.5" />}
           options={DEVICE_FILTERS}
           value={filters.device}
           onChange={(v) => updateFilter('device', v)}
         />
 
         <Separator orientation="vertical" className="h-5 hidden sm:block" />
 
         {/* Region */}
         <FilterChip
           label="Region"
           icon={<Globe2 className="h-3.5 w-3.5" />}
           options={REGION_FILTERS}
           value={filters.region}
           onChange={(v) => updateFilter('region', v)}
         />
 
         {/* Capability */}
         <FilterChip
           label="Capability"
           icon={<Cpu className="h-3.5 w-3.5" />}
           options={CAPABILITY_FILTERS}
           value={filters.capability}
           onChange={(v) => updateFilter('capability', v)}
         />
 
         {/* Industry */}
         <FilterChip
           label="Industry"
           icon={<Building2 className="h-3.5 w-3.5" />}
           options={INDUSTRY_FILTERS}
           value={filters.industry}
           onChange={(v) => updateFilter('industry', v)}
         />
       </div>
 
       {/* Active Filters Display */}
       {activeFilterCount > 0 && (
         <div className="flex flex-wrap items-center gap-1.5">
           <span className="text-xs text-muted-foreground">Active:</span>
           {filters.category !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {CATEGORY_FILTERS.find(f => f.value === filters.category)?.icon}
               {CATEGORY_FILTERS.find(f => f.value === filters.category)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('category', 'all')}
               />
             </Badge>
           )}
           {filters.combination !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {COMBINATION_FILTERS.find(f => f.value === filters.combination)?.icon}
               {COMBINATION_FILTERS.find(f => f.value === filters.combination)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('combination', 'all')}
               />
             </Badge>
           )}
           {filters.device !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {DEVICE_FILTERS.find(f => f.value === filters.device)?.icon}
               {DEVICE_FILTERS.find(f => f.value === filters.device)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('device', 'all')}
               />
             </Badge>
           )}
           {filters.region !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {REGION_FILTERS.find(f => f.value === filters.region)?.icon}
               {REGION_FILTERS.find(f => f.value === filters.region)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('region', 'all')}
               />
             </Badge>
           )}
           {filters.capability !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {CAPABILITY_FILTERS.find(f => f.value === filters.capability)?.icon}
               {CAPABILITY_FILTERS.find(f => f.value === filters.capability)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('capability', 'all')}
               />
             </Badge>
           )}
           {filters.industry !== 'all' && (
             <Badge variant="outline" className="gap-1 text-xs">
               {INDUSTRY_FILTERS.find(f => f.value === filters.industry)?.icon}
               {INDUSTRY_FILTERS.find(f => f.value === filters.industry)?.label}
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('industry', 'all')}
               />
             </Badge>
           )}
           {filters.search.trim() && (
             <Badge variant="outline" className="gap-1 text-xs">
               🔍 "{filters.search}"
               <X
                 className="h-3 w-3 cursor-pointer hover:text-destructive"
                 onClick={() => updateFilter('search', '')}
               />
             </Badge>
           )}
         </div>
       )}
     </div>
   );
 };
 
 // Export filter matching helper
 export const matchesCombinationFilter = (
   blueprint: any,
   combinationValue: string
 ): boolean => {
   if (combinationValue === 'all') return true;
   
   const filter = COMBINATION_FILTERS.find(f => f.value === combinationValue);
   if (!filter || !filter.keywords) return true;
   
   const nameLC = blueprint.name?.toLowerCase() || '';
   const descLC = blueprint.description?.toLowerCase() || '';
   const settings = blueprint.default_settings as any;
   const capabilities = settings?.ai_capabilities || [];
   const capTypes = capabilities.map((c: any) => c.type?.toLowerCase() || '').join(' ');
   
   const searchText = `${nameLC} ${descLC} ${capTypes}`;
   
   // Must match multiple keywords for combination
   const matchCount = filter.keywords.filter(kw => searchText.includes(kw)).length;
   return matchCount >= 2; // At least 2 matching keywords
 };
 
 export const matchesDeviceFilter = (
   blueprint: any,
   deviceValue: string
 ): boolean => {
   if (deviceValue === 'all') return true;
   
   const filter = DEVICE_FILTERS.find(f => f.value === deviceValue);
   if (!filter || !filter.keywords) return true;
   
   const nameLC = blueprint.name?.toLowerCase() || '';
   const descLC = blueprint.description?.toLowerCase() || '';
   const platforms = (blueprint.target_platform || []).map((p: string) => p.toLowerCase()).join(' ');
   
   const searchText = `${nameLC} ${descLC} ${platforms}`;
   
   return filter.keywords.some(kw => searchText.includes(kw));
 };
 
 export default TemplateFilterBar;