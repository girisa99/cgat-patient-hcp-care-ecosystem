# Memory: features/localization/eu-latam-nam-sub-region-routing-v1
Updated: just now

## Europe — 6 Sub-Regions

| Sub-Region | LLM Primary | Fallback Chain | TTS Primary | Differentiator |
|------------|-------------|----------------|-------------|---------------|
| **EU_WEST** (UK, Ireland) | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (en-GB) | British English tone/spelling |
| **EU_DACH** (Germany, Austria, Switzerland) | Claude 4 | GPT-4o → DeepSeek → Gemini | Azure Neural (de-DE/AT/CH) | Sie/du formality registers |
| **EU_FRANCE** (France, Belgium FR) | Claude 4 | GPT-4o → DeepSeek → Gemini | Azure Neural (fr-FR/BE) | Anthropic strong French |
| **EU_IBERIA** (Spain, Portugal) | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (es-ES, pt-PT) | EU Portuguese ≠ Brazilian |
| **EU_NORDIC** (Sweden, Norway, Denmark, Finland) | GPT-4o | Claude 4 → Gemini → DeepSeek | Azure Neural (sv/nb/da/fi) | GPT-4o leads Nordic benchmarks |
| **EU_EAST** (Poland, Czech, Romania, Hungary) | GPT-4o | Claude 4 → DeepSeek → Gemini | Azure Neural (pl/cs/ro/hu) | GPT-4o stronger for smaller EU languages |

## LATAM — 5 Sub-Regions

| Sub-Region | LLM Primary | Fallback Chain | TTS Primary | Differentiator |
|------------|-------------|----------------|-------------|---------------|
| **LATAM_BRAZIL** | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (pt-BR) | 215M speakers, PT-BR ≠ PT-PT |
| **LATAM_MEXICO** (+ Central America) | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (es-MX) | #1 Spanish dialect globally |
| **LATAM_ANDEAN** (Colombia, Peru, Ecuador) | GPT-4o | Claude 4 → Gemini → DeepSeek | Azure Neural (es-CO/PE) | Vos usage, indigenous influence |
| **LATAM_CONESUR** (Argentina, Chile, Uruguay) | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (es-AR/CL) | Rioplatense — Italian-influenced |
| **LATAM_CARIB** (DR, PR, Cuba, Venezuela) | GPT-4o | Claude 4 → Gemini → DeepSeek | Azure Neural (es-DO/VE) | Fast-paced, dropped consonants |

## NAM — 2 Sub-Regions

| Sub-Region | LLM Primary | Fallback Chain | TTS Primary | Differentiator |
|------------|-------------|----------------|-------------|---------------|
| **NAM_US** | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (en-US) | American English |
| **NAM_CA** | Claude 4 | GPT-4o → Gemini → DeepSeek | Azure Neural (en-CA, fr-CA) | Bilingual EN+FR market |

Last Updated: 2026-02-11
