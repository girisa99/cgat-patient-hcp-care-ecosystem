# Memory: features/localization/cjk-sub-region-routing-v1
Updated: just now

The 'CJK' regional zone is split into four distinct sub-regions—CN (Mainland China/HK/Macau), TW (Taiwan), JP (Japan), and KR (South Korea)—to address critical linguistic and cultural differences. All sub-regions utilize Qwen Max as the primary LLM (strongest native CJK support from Alibaba). TTS is split: Alibaba Qwen3-TTS for CN/JP (native CJK prosody via Singapore hub), Azure Neural for KR (ko-KR) and TW (zh-TW) where Azure has superior voice coverage. Fallback LLM chains: CN uses GPT-4o → Gemini; JP/KR use GPT-4o → Claude 4; Taiwan uses Claude 4 → GPT-4o (Western-aligned business tone). Key differentiators: Simplified vs Traditional Chinese distinction, Taiwan treated as separate cultural context from mainland, Korean honorific levels (존댓말/반말) for B2B vs B2C, and Japanese Keigo formality registers.

Last Updated: 2026-02-11
