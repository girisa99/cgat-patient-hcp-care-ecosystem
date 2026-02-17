# Memory: features/genie-cast/script-generation-metadata-english-companion-v1
Updated: just now

## Script Generation Metadata + English Companion

### Generation Metadata on `regional_narration_scripts`
New columns capture full AI generation context:
- `llm_provider`: Which AI provider generated the script (claude, openai, gemini, alibaba, deepseek)
- `llm_model`: Specific model used (claude-4, gpt-4o, qwen-max, gemini-3-pro)
- `llm_temperature`: Temperature setting during generation
- `llm_token_count`: Total tokens consumed
- `llm_prompt_template`: Prompt template identifier
- `routing_decision`: Human-readable explanation of why this provider was chosen
- `routing_confidence_score`: 0-1 confidence score for the routing decision
- `routing_zone`: Zone used (western, cjk, mena, india, sea, africa, latam)
- `generation_timestamp`: Exact timestamp of AI generation

### English Companion Auto-Generation
- `is_english_base`: Boolean flag marking English source-of-truth versions
- `english_base_script_id`: FK linking regional scripts to their English companion
- When a non-English script is accepted (via AI improvement), an English companion is auto-created
- English companion uses Azure `en-US-JennyNeural` voice as default TTS
- English companion is created as `draft` status for review
- The regional script's `english_base_script_id` links back to the English version

### Metadata Propagation
- `handleCreateVariant`: Carries forward llm_provider, llm_model, routing_zone, is_english_base, english_base_script_id
- `handleNewVersion`: Same propagation
- `handleAcceptImproved`: Full metadata from AI generation stored

Last Updated: 2026-02-11
