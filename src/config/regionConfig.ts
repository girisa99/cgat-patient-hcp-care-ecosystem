/**
 * Shared Region & Language Configuration
 * Single source of truth for all Genie Cast components:
 * - CreateTemplateDialog
 * - RegionalAssetsLab
 * - InteractiveWorkflowFlowchart
 * - ProductionConfigTab
 * - LandingPageScriptsPanel
 * 
 * Structure: 15 Parent Regions → 62+ Sub-Regions → 140+ Languages
 * Follows the 4-zone AI provider routing architecture.
 */

export interface SubRegionConfig {
  code: string;
  label: string;
  languages: string[];
  llm: string;
  ttsProvider: string;
  ttsLocale: string;
}

export interface RegionGroupConfig {
  parent: string;
  icon: string;
  regions: SubRegionConfig[];
}

// ─── Master Region Groups: 15 Parents → 62+ Sub-Regions ─────────────────
export const MASTER_REGION_GROUPS: RegionGroupConfig[] = [
  {
    parent: 'NAM', icon: '🇺🇸',
    regions: [
      { code: 'NAM_US', label: '🇺🇸 United States', languages: ['en'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-US' },
      { code: 'NAM_CA', label: '🇨🇦 Canada', languages: ['en', 'fr_ca'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-CA' },
      { code: 'NAM_US_SOUTH', label: '🇺🇸 US South', languages: ['en', 'es_us'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-US' },
      { code: 'NAM_US_WEST', label: '🇺🇸 US West Coast', languages: ['en', 'es_us'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-US' },
    ]
  },
  {
    parent: 'UK & ANZ', icon: '🇬🇧',
    regions: [
      { code: 'UK', label: '🇬🇧 United Kingdom', languages: ['en_gb'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-GB' },
      { code: 'OCEANIA_AU', label: '🇦🇺 Australia', languages: ['en_au'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-AU' },
      { code: 'OCEANIA_NZ', label: '🇳🇿 New Zealand', languages: ['en_nz', 'mi'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-NZ' },
    ]
  },
  {
    parent: 'Europe', icon: '🇪🇺',
    regions: [
      { code: 'EU_WEST', label: '🇫🇷 Western Europe', languages: ['fr', 'nl', 'nl_be'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'fr-FR' },
      { code: 'EU_DACH', label: '🇩🇪 DACH (DE/AT/CH)', languages: ['de', 'de_at', 'de_ch'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'de-DE' },
      { code: 'EU_NORDIC', label: '🇸🇪 Nordics', languages: ['sv', 'da', 'no', 'fi', 'is'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'sv-SE' },
      { code: 'EU_SOUTH', label: '🇪🇸 Southern Europe', languages: ['es', 'it', 'pt_pt', 'el', 'mt'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-ES' },
      { code: 'EU_BENELUX', label: '🇳🇱 Benelux', languages: ['nl', 'nl_be', 'fr_be', 'lb'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'nl-NL' },
    ]
  },
  {
    parent: 'Eastern Europe', icon: '🇵🇱',
    regions: [
      { code: 'EU_EAST_PL', label: '🇵🇱 Poland', languages: ['pl'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'pl-PL' },
      { code: 'EU_EAST_UA', label: '🇺🇦 Ukraine', languages: ['uk'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'uk-UA' },
      { code: 'EU_EAST_BALKANS', label: '🇷🇸 Balkans', languages: ['sr', 'hr', 'bs', 'sl', 'mk', 'sq'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'sr-RS' },
      { code: 'EU_EAST_RO', label: '🇷🇴 Romania', languages: ['ro'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ro-RO' },
      { code: 'EU_TURKEY', label: '🇹🇷 Turkey', languages: ['tr'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'tr-TR' },
      { code: 'EU_BALTICS', label: '🇱🇹 Baltics', languages: ['lt', 'lv', 'et'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'lt-LT' },
    ]
  },
  {
    parent: 'India', icon: '🇮🇳',
    regions: [
      { code: 'INDIA_NORTH', label: '🇮🇳 North India (Hindi)', languages: ['hi', 'pa', 'ur', 'ks', 'doi'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'hi-IN' },
      { code: 'INDIA_SOUTH', label: '🇮🇳 South India (Tamil)', languages: ['te', 'kn', 'ta', 'ml'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'ta-IN' },
      { code: 'INDIA_WEST', label: '🇮🇳 West India (Marathi)', languages: ['mr', 'gu', 'kok', 'sd'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'mr-IN' },
      { code: 'INDIA_EAST', label: '🇮🇳 East India (Bengali)', languages: ['bn', 'or', 'as', 'mni', 'sat'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'bn-IN' },
      { code: 'INDIA_NE', label: '🇮🇳 Northeast', languages: ['as', 'mni', 'bho', 'mai'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'as-IN' },
      { code: 'INDIA_PAN', label: '🇮🇳 Pan-India', languages: ['hi', 'en_in'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'hi-IN' },
    ]
  },
  {
    parent: 'South Asia', icon: '🌏',
    regions: [
      { code: 'SA_PAKISTAN', label: '🇵🇰 Pakistan', languages: ['ur', 'pa', 'sd', 'ps'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ur-PK' },
      { code: 'SA_BANGLADESH', label: '🇧🇩 Bangladesh', languages: ['bn'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'bn-BD' },
      { code: 'SA_SRI_LANKA', label: '🇱🇰 Sri Lanka', languages: ['si', 'ta'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'si-LK' },
      { code: 'SA_NEPAL', label: '🇳🇵 Nepal', languages: ['ne'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ne-NP' },
    ]
  },
  {
    parent: 'MENA', icon: '🇸🇦',
    regions: [
      { code: 'MENA_GULF', label: '🇦🇪 Gulf States', languages: ['ar_sa', 'ar_ae', 'ar_kw', 'ar_bh', 'ar_qa', 'ar_om'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ar-SA' },
      { code: 'MENA_LEVANT', label: '🇯🇴 Levant', languages: ['ar_lb', 'ar_jo', 'ar_iq'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-JO' },
      { code: 'MENA_MAGHREB', label: '🇲🇦 Maghreb', languages: ['ar_ma', 'ar_dz', 'ar_tn', 'ar_ly'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-MA' },
      { code: 'MENA_EGYPT', label: '🇪🇬 Egypt', languages: ['ar_eg'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-EG' },
      { code: 'MENA_IRAQ', label: '🇮🇶 Iraq', languages: ['ar_iq', 'ku'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-IQ' },
      { code: 'MENA_IRAN', label: '🇮🇷 Iran/Afghanistan', languages: ['fa', 'ps'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'fa-IR' },
    ]
  },
  {
    parent: 'CJK', icon: '🇨🇳',
    regions: [
      { code: 'CJK_CN', label: '🇨🇳 China', languages: ['zh_cn'], llm: 'Qwen Max', ttsProvider: 'Qwen3-TTS', ttsLocale: 'longwan' },
      { code: 'CJK_JP', label: '🇯🇵 Japan', languages: ['ja'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ja-JP' },
      { code: 'CJK_KR', label: '🇰🇷 South Korea', languages: ['ko'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ko-KR' },
      { code: 'CJK_TW', label: '🇹🇼 Taiwan', languages: ['zh_tw'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'zh-TW' },
      { code: 'CJK_HK', label: '🇭🇰 Hong Kong', languages: ['zh_hk'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'zh-HK' },
      { code: 'CJK_PAN_EN', label: '🌏 Pan-CJK English', languages: ['en'], llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'en-HK' },
    ]
  },
  {
    parent: 'Southeast Asia', icon: '🇸🇬',
    regions: [
      { code: 'SEA_PAN', label: '🌏 Pan-SEA (EN)', languages: ['en'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-SG' },
      { code: 'SEA_MALAY', label: '🇲🇾 Malaysia', languages: ['ms'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'ms-MY' },
      { code: 'SEA_THAI', label: '🇹🇭 Thailand', languages: ['th'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'th-TH' },
      { code: 'SEA_VIET', label: '🇻🇳 Vietnam', languages: ['vi'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'vi-VN' },
      { code: 'SEA_PHIL', label: '🇵🇭 Philippines', languages: ['fil', 'tl', 'ceb', 'ilo'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'fil-PH' },
      { code: 'SEA_INDO', label: '🇮🇩 Indonesia', languages: ['id', 'jv', 'su'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'id-ID' },
      { code: 'SEA_MYANMAR', label: '🇲🇲 Myanmar', languages: ['my'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'my-MM' },
      { code: 'SEA_CAMBODIA', label: '🇰🇭 Cambodia', languages: ['km'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'km-KH' },
    ]
  },
  {
    parent: 'LATAM', icon: '🇧🇷',
    regions: [
      { code: 'LATAM_BR', label: '🇧🇷 Brazil', languages: ['pt_br'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'pt-BR' },
      { code: 'LATAM_MX', label: '🇲🇽 Mexico', languages: ['es_mx'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-MX' },
      { code: 'LATAM_CONE', label: '🇦🇷 Southern Cone', languages: ['es_ar', 'es_cl', 'es_uy', 'es_py'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-AR' },
      { code: 'LATAM_ANDEAN', label: '🇨🇴 Andean', languages: ['es_co', 'es_pe', 'es_ec', 'es_bo', 'es_ve', 'qu', 'ay'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-CO' },
      { code: 'LATAM_CARIB', label: '🇯🇲 Caribbean', languages: ['es_cu', 'es_do', 'es_pr', 'ht'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'es-DO' },
      { code: 'LATAM_CENTRAL', label: '🇨🇷 Central America', languages: ['es_cr', 'es_pa', 'es_gt', 'es_hn', 'es_sv', 'es_ni'], llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-CR' },
    ]
  },
  {
    parent: 'Africa', icon: '🌍',
    regions: [
      { code: 'AFRICA_WEST', label: '🇳🇬 West Africa', languages: ['en_ng', 'en_gh', 'ha', 'ig', 'yo'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'en-NG' },
      { code: 'AFRICA_EAST', label: '🇰🇪 East Africa', languages: ['en_ke', 'sw', 'am', 'om', 'ti', 'so', 'rw', 'lg'], llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'sw-KE' },
      { code: 'AFRICA_SOUTH', label: '🇿🇦 Southern Africa', languages: ['en_za', 'af', 'zu', 'xh', 'st', 'tn', 'sn', 'nd', 'ny'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'en-ZA' },
      { code: 'AFRICA_NORTH', label: '🇪🇬 North Africa', languages: ['ar_eg', 'ar_ly', 'ar_sd'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-EG' },
    ]
  },
  {
    parent: 'Caucasus', icon: '🇬🇪',
    regions: [
      { code: 'CAUC_GE', label: '🇬🇪 Georgia', languages: ['ka'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ka-GE' },
      { code: 'CAUC_AM', label: '🇦🇲 Armenia', languages: ['hy'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'hy-AM' },
      { code: 'CAUC_AZ', label: '🇦🇿 Azerbaijan', languages: ['az'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'az-AZ' },
    ]
  },
  {
    parent: 'Central Asia', icon: '🇰🇿',
    regions: [
      { code: 'ASIA_CENTRAL_KZ', label: '🇰🇿 Kazakhstan', languages: ['kk', 'ru'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'kk-KZ' },
      { code: 'ASIA_CENTRAL_UZ', label: '🇺🇿 Uzbekistan', languages: ['uz'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'uz-UZ' },
      { code: 'ASIA_CENTRAL_KG', label: '🇰🇬 Kyrgyzstan', languages: ['ky'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ky-KG' },
    ]
  },
  {
    parent: 'Oceania', icon: '🇦🇺',
    regions: [
      { code: 'OCEANIA_PACIFIC', label: '🏝️ Pacific Islands', languages: ['sm', 'to', 'fj', 'ty', 'haw'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'en-AU' },
    ]
  },
  {
    parent: 'Israel & Hebrew', icon: '🇮🇱',
    regions: [
      { code: 'ISRAEL', label: '🇮🇱 Israel', languages: ['he'], llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'he-IL' },
    ]
  },
];

// Flat list of all sub-regions
export const ALL_REGIONS = MASTER_REGION_GROUPS.flatMap(g => g.regions);

// All unique languages across all regions
export const ALL_LANGUAGES = [...new Set(ALL_REGIONS.flatMap(r => r.languages))];

// ─── Language Display Names (140+) ─────────────────────────────────────
export const LANGUAGE_NAMES: Record<string, string> = {
  // English variants
  en: 'English (US)', en_gb: 'English (UK)', en_au: 'English (Australia)',
  en_nz: 'English (New Zealand)', en_in: 'English (India)', en_za: 'English (South Africa)',
  en_ng: 'English (Nigeria)', en_ke: 'English (Kenya)', en_gh: 'English (Ghana)',
  // Spanish variants
  es: 'Spanish (Spain)', es_mx: 'Spanish (Mexico)', es_us: 'Spanish (US)', es_ar: 'Spanish (Argentina)',
  es_co: 'Spanish (Colombia)', es_cl: 'Spanish (Chile)', es_pe: 'Spanish (Peru)', es_ve: 'Spanish (Venezuela)',
  es_ec: 'Spanish (Ecuador)', es_bo: 'Spanish (Bolivia)', es_py: 'Spanish (Paraguay)', es_uy: 'Spanish (Uruguay)',
  es_cr: 'Spanish (Costa Rica)', es_pa: 'Spanish (Panama)', es_cu: 'Spanish (Cuba)', es_do: 'Spanish (Dominican Rep)',
  es_pr: 'Spanish (Puerto Rico)', es_gt: 'Spanish (Guatemala)', es_hn: 'Spanish (Honduras)',
  es_sv: 'Spanish (El Salvador)', es_ni: 'Spanish (Nicaragua)',
  // Portuguese variants
  pt_br: 'Portuguese (Brazil)', pt_pt: 'Portuguese (Portugal)',
  // French variants
  fr: 'French (France)', fr_ca: 'French (Canada)', fr_be: 'French (Belgium)', fr_ch: 'French (Switzerland)',
  // German variants
  de: 'German (Germany)', de_at: 'German (Austria)', de_ch: 'German (Switzerland)',
  // Chinese variants
  zh_cn: 'Chinese (Simplified)', zh_tw: 'Chinese (Traditional)', zh_hk: 'Chinese (Hong Kong)',
  // Arabic variants
  ar_sa: 'Arabic (Saudi)', ar_eg: 'Arabic (Egyptian)', ar_ae: 'Arabic (UAE)',
  ar_ma: 'Arabic (Moroccan)', ar_dz: 'Arabic (Algerian)', ar_tn: 'Arabic (Tunisian)', ar_lb: 'Arabic (Lebanese)',
  ar_jo: 'Arabic (Jordanian)', ar_iq: 'Arabic (Iraqi)', ar_kw: 'Arabic (Kuwaiti)', ar_bh: 'Arabic (Bahraini)',
  ar_qa: 'Arabic (Qatari)', ar_om: 'Arabic (Omani)', ar_ye: 'Arabic (Yemeni)', ar_ly: 'Arabic (Libyan)',
  ar_sd: 'Arabic (Sudanese)',
  // Dutch variants
  nl: 'Dutch (Netherlands)', nl_be: 'Dutch (Belgium)',
  // European
  it: 'Italian', pl: 'Polish', cs: 'Czech', sk: 'Slovak', hu: 'Hungarian',
  ro: 'Romanian', bg: 'Bulgarian', el: 'Greek', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian',
  sl: 'Slovenian', hr: 'Croatian', sr: 'Serbian', bs: 'Bosnian', mk: 'Macedonian',
  sq: 'Albanian', uk: 'Ukrainian', be: 'Belarusian', ru: 'Russian',
  ga: 'Irish', cy: 'Welsh', gd: 'Scottish Gaelic', mt: 'Maltese', lb: 'Luxembourgish',
  is: 'Icelandic', fo: 'Faroese', ca: 'Catalan', gl: 'Galician', eu: 'Basque',
  // CJK
  ja: 'Japanese', ko: 'Korean', mn: 'Mongolian',
  // Indian languages (24+)
  hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ta: 'Tamil', mr: 'Marathi', bn: 'Bengali',
  gu: 'Gujarati', ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', as: 'Assamese',
  ks: 'Kashmiri', ne: 'Nepali', sd: 'Sindhi', ur: 'Urdu', si: 'Sinhala', dv: 'Dhivehi',
  bho: 'Bhojpuri', mai: 'Maithili', kok: 'Konkani', doi: 'Dogri', mni: 'Manipuri', sat: 'Santali',
  // MENA
  he: 'Hebrew', fa: 'Persian/Farsi', ps: 'Pashto', ku: 'Kurdish', tr: 'Turkish', az: 'Azerbaijani',
  // Southeast Asian
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese', fil: 'Filipino', tl: 'Tagalog',
  my: 'Burmese', km: 'Khmer', lo: 'Lao', jv: 'Javanese', su: 'Sundanese',
  ceb: 'Cebuano', ilo: 'Ilocano', war: 'Waray', bcl: 'Bikol',
  // Latin American indigenous
  ht: 'Haitian Creole', gn: 'Guaraní', qu: 'Quechua', ay: 'Aymara',
  // African languages
  af: 'Afrikaans', zu: 'Zulu', xh: 'Xhosa', st: 'Sotho', tn: 'Tswana',
  sw: 'Swahili', am: 'Amharic', om: 'Oromo', ti: 'Tigrinya', so: 'Somali',
  ha: 'Hausa', ig: 'Igbo', yo: 'Yoruba', rw: 'Kinyarwanda', mg: 'Malagasy',
  sn: 'Shona', nd: 'Ndebele', ny: 'Chewa', lg: 'Luganda',
  // Oceanian
  mi: 'Māori', sm: 'Samoan', to: 'Tongan', fj: 'Fijian', ty: 'Tahitian', haw: 'Hawaiian',
  // Caucasus / Central Asia
  ka: 'Georgian', hy: 'Armenian', kk: 'Kazakh', ky: 'Kyrgyz', uz: 'Uzbek',
};

// ─── Helper: Get languages for selected regions ─────────────────────────
export function getLanguagesForRegions(selectedRegionCodes: string[]): { value: string; label: string }[] {
  const langSet = new Set<string>();
  
  MASTER_REGION_GROUPS.forEach(group => {
    const parentSelected = selectedRegionCodes.includes(group.parent);
    group.regions.forEach(sub => {
      if (parentSelected || selectedRegionCodes.includes(sub.code)) {
        sub.languages.forEach(l => langSet.add(l));
      }
    });
  });

  return [...langSet]
    .map(code => ({ value: code, label: LANGUAGE_NAMES[code] || code }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ─── Helper: Build flat dropdown options with parent headers ────────────
export function buildRegionDropdownOptions(): { value: string; label: string; icon: string; isParent: boolean }[] {
  return MASTER_REGION_GROUPS.flatMap(group => [
    { value: group.parent, label: `${group.icon} ${group.parent}`, icon: group.icon, isParent: true },
    ...group.regions.map(sr => ({
      value: sr.code,
      label: `  ↳ ${sr.label}`,
      icon: '',
      isParent: false,
    })),
  ]);
}

// ─── Helper: Toggle parent region (selects/deselects all sub-regions) ───
export function toggleParentRegion(parentName: string, currentSelections: string[]): string[] {
  const group = MASTER_REGION_GROUPS.find(g => g.parent === parentName);
  if (!group) return currentSelections;

  const subCodes = group.regions.map(r => r.code);
  const isSelected = currentSelections.includes(parentName);

  if (isSelected) {
    // Deselect parent + all subs
    return currentSelections.filter(r => r !== parentName && !subCodes.includes(r));
  } else {
    // Select parent + all subs
    return [...new Set([...currentSelections, parentName, ...subCodes])];
  }
}

// ─── Helper: Get AI routing info for a sub-region ───────────────────────
export function getRegionAIRouting(regionCode: string) {
  const sub = ALL_REGIONS.find(r => r.code === regionCode);
  if (!sub) return { llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'en-US' };
  return { llm: sub.llm, ttsProvider: sub.ttsProvider, ttsLocale: sub.ttsLocale };
}
