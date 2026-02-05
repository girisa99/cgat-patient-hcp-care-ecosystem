 # Memory: architecture/ai/template-style-intent-abstraction
 Updated: just now
 
 ## Style Abstraction: Decoupling Templates from AI Providers
 
 ### The Problem
 
 Many existing templates were generated using OpenAI/DALL-E, but the master routing registry designates DALL-E as "LAST RESORT ONLY." This creates a conflict between template fidelity and routing optimization.
 
 ### Solution: Style Intent Abstraction
 
 Instead of hardcoding a provider in templates, we store a **Style Intent** that the routing engine interprets at generation time.
 
 ```
 TEMPLATE METADATA (Before)          TEMPLATE METADATA (After)
 ─────────────────────────          ─────────────────────────
 provider: "openai-dalle-3"    →    style_intent: "photorealistic"
 model: "dall-e-3"                  tone: "professional"
                                    aesthetic: "clean-modern"
 ```
 
 ### Style Intent → Provider Mapping
 
 | Style Intent | Primary Provider | Secondary | Tertiary | Fallback |
 |--------------|------------------|-----------|----------|----------|
 | `photorealistic` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 | `cinematic` | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 | ModelsLab |
 | `anime` | ModelsLab Anime | Alibaba Wan 2.6 | Replicate | — |
 | `pixar-3d` | Alibaba Wan 2.6 | ModelsLab | Meshy 3D | — |
 | `watercolor` | ModelsLab | Vertex Imagen 3 | Alibaba | DALL-E |
 | `minimalist` | Gemini 3 Pro | Banana Nano | ModelsLab FLUX | DALL-E |
 | `corporate` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 | `editorial` | Vertex Imagen 3 | Gemini 3 Pro | ModelsLab | DALL-E |
 | `product-hero` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 | `lifestyle` | ModelsLab FLUX | Gemini 3 Pro | Vertex Imagen 3 | DALL-E |
 
 ### Regional Override Layer
 
 Style intent is resolved AFTER zone routing applies:
 
 ```
 USER (IP: Dubai) selects template (style_intent: photorealistic)
   → Zone Detection: MENA/RTL (Alibaba Zone)
   → Style Resolution: photorealistic → Gemini 3 Pro
   → BUT: TTS/LLM uses Alibaba (Qwen-Max, Azure Neural for 7 Arabic dialects)
   → RESULT: Hybrid - Gemini for images, Azure for TTS, Qwen for scripts
 ```
 
 ### Template Schema Extension
 
 ```typescript
 interface TemplateBlueprint {
   // Existing fields...
   
   // NEW: Style Abstraction
   style_intent: StyleIntent;
   tone_modifier?: 'professional' | 'casual' | 'luxury' | 'playful';
   aesthetic_keywords?: string[]; // e.g., ['clean', 'modern', 'bold']
   
   // DEPRECATED: Direct provider reference
   // original_provider?: string; // Keep for audit trail only
 }
 
 type StyleIntent = 
   | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
   | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
   | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
   | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup';
 ```
 
 ### Benefits
 
 1. **Cost Optimization**: Routes to cost-effective providers (Gemini vs DALL-E)
 2. **Regional Quality**: Applies 4-zone routing for TTS/LLM while optimizing images
 3. **Future-Proof**: New providers can be added to style mappings without template changes
 4. **Audit Trail**: Original provider stored for reference but not used