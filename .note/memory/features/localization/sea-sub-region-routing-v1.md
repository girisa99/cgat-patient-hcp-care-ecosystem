# Memory: features/localization/sea-sub-region-routing-v1
Updated: just now

The 'SEA' regional zone is split into five distinct sub-regions—MALAY (Malaysia/Indonesia), THAI (Thailand), VIET (Vietnam), PHIL (Philippines), and PAN (Singapore/Pan-SEA English)—to address Southeast Asia's linguistic and cultural diversity. All sub-regions utilize Gemini 3 Pro as the primary LLM (strong SEA language coverage, Indonesia is a key Google market) and Azure Neural for TTS (ms-MY, id-ID, th-TH, vi-VN, fil-PH, en-SG locale codes). Fallback LLM chains are tailored: PHIL and PAN prioritize Claude 4 (English-heavy/business contexts, Taglish code-switching); MALAY, THAI, and VIET prioritize GPT-4o. Key differentiators: Malay vs Indonesian distinction (competitors treat as one), Taglish code-switching for Philippines, and Singlish/SEA English accent for Singapore rather than defaulting to US/UK.

Last Updated: 2026-02-11
