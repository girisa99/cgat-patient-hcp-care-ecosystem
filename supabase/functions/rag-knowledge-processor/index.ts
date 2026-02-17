import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log(`🔄 Processing RAG action: ${action}`);

    switch (action) {
      case 'add_knowledge':
        return await addKnowledge(params);
      case 'process_url':
        return await processUrl(params);
      case 'classify_content':
        return await classifyContent(params);
      case 'summarize_content':
        return await summarizeContent(params);
      case 'extract_entities':
        return await extractEntities(params);
      case 'get_recommendations':
        return await getRecommendations(params);
      case 'web_crawl':
        return await webCrawl(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ RAG processor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process RAG request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Add knowledge with Universal AI processing
 */
async function addKnowledge(params: any) {
  const { 
    name, 
    description, 
    category, 
    sourceType, 
    content, 
    url, 
    healthcareTags, 
    modalityType,
    userId 
  } = params;

  // Process and clean content
  const processedContent = processTextContent(content, sourceType);
  
  // Use Universal AI for classification and entity extraction
  const [classification, entities, summary] = await Promise.all([
    classifyWithUniversalAI(processedContent),
    extractEntitiesWithUniversalAI(processedContent),
    summarizeWithUniversalAI(processedContent, 100)
  ]);

  const knowledgeData = {
    name: name || entities?.title || 'Untitled',
    description: summary || description,
    category: classification?.primaryCategory || category,
    source_type: sourceType,
    source_url: url,
    content_type: sourceType === 'document_upload' ? 'text' : 'html',
    raw_content: content,
    processed_content: processedContent,
    healthcare_tags: entities?.healthcareTags || healthcareTags || [],
    modality_type: modalityType,
    treatment_category: classification?.treatmentCategory || inferTreatmentCategory(content, category),
    regulatory_status: classification?.regulatoryStatus || inferRegulatoryStatus(content),
    created_by: userId,
    metadata: {
      processing_timestamp: new Date().toISOString(),
      content_length: content?.length || 0,
      ai_classification: classification,
      ai_entities: entities,
      healthcare_focus: category
    }
  };

  const { data, error } = await supabase
    .from('knowledge_base')
    .insert(knowledgeData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add knowledge: ${error.message}`);
  }

  console.log(`✅ Knowledge added with AI processing: ${data.id}`);

  return new Response(
    JSON.stringify({ 
      success: true,
      knowledgeId: data.id,
      classification,
      entities,
      summary,
      message: 'Knowledge added with AI processing'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Process URL with Universal AI
 */
async function processUrl(params: any) {
  const { url, category, userId } = params;
  
  console.log(`🌐 Processing URL: ${url}`);
  
  // Fetch content from URL
  const response = await fetch(url);
  const html = await response.text();
  const textContent = extractTextFromHtml(html);
  const title = extractTitleFromHtml(html);
  
  // Use Universal AI to process the content
  const [classification, entities, summary] = await Promise.all([
    classifyWithUniversalAI(textContent),
    extractEntitiesWithUniversalAI(textContent),
    summarizeWithUniversalAI(textContent, 200)
  ]);

  const knowledgeData = {
    name: title || entities?.title || url,
    description: summary || `Content from ${url}`,
    category: classification?.primaryCategory || category || 'general',
    source_type: 'html_link',
    source_url: url,
    content_type: 'html',
    raw_content: html,
    processed_content: textContent,
    healthcare_tags: entities?.healthcareTags || [],
    created_by: userId,
    metadata: {
      url,
      processing_timestamp: new Date().toISOString(),
      content_length: textContent.length,
      ai_classification: classification,
      ai_entities: entities
    }
  };

  const { data, error } = await supabase
    .from('knowledge_base')
    .insert(knowledgeData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to process URL: ${error.message}`);
  }

  console.log(`✅ URL processed with AI: ${data.id}`);

  return new Response(
    JSON.stringify({ 
      success: true,
      knowledgeId: data.id,
      title: knowledgeData.name,
      classification,
      entities,
      summary,
      extractedContent: textContent.substring(0, 500) + '...',
      message: 'URL processed with AI analysis'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Classify content using Universal AI
 */
async function classifyContent(params: any) {
  const { content, context } = params;
  
  const classification = await classifyWithUniversalAI(content, context);
  
  return new Response(
    JSON.stringify({ success: true, classification }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Summarize content using Universal AI
 */
async function summarizeContent(params: any) {
  const { content, maxLength = 200 } = params;
  
  const summary = await summarizeWithUniversalAI(content, maxLength);
  
  return new Response(
    JSON.stringify({ success: true, summary }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Extract entities using Universal AI
 */
async function extractEntities(params: any) {
  const { content, entityTypes } = params;
  
  const entities = await extractEntitiesWithUniversalAI(content, entityTypes);
  
  return new Response(
    JSON.stringify({ success: true, entities }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Get recommendations using Universal AI
 */
async function getRecommendations(params: any) {
  const { query, conversationId, userId, healthcareContext } = params;
  
  console.log(`🎯 Generating recommendations for: ${query}`);

  // Get relevant knowledge using rag-search
  const { data: searchData, error: searchError } = await supabase.functions.invoke('rag-search', {
    body: { 
      query, 
      limit: 10,
      useSemanticReranking: true,
      includeClassification: true,
      includeSummary: true
    }
  });

  if (searchError) {
    throw new Error(`Search failed: ${searchError.message}`);
  }

  const relevantEntries = searchData?.results || [];

  // Generate AI-powered recommendations
  const recommendations = await generateAIRecommendations(query, relevantEntries, healthcareContext);

  // Store recommendations
  const recommendationData = {
    conversation_id: conversationId,
    knowledge_base_ids: relevantEntries.map((e: any) => e.document.id),
    query_context: query,
    recommendations: recommendations.recommendations,
    next_best_actions: recommendations.nextBestActions,
    confidence_score: recommendations.confidence,
    healthcare_context: healthcareContext || {},
    treatment_recommendations: recommendations.treatmentRecommendations,
    clinical_insights: recommendations.clinicalInsights
  };

  const { error: recError } = await supabase
    .from('rag_recommendations')
    .insert(recommendationData);

  if (recError) {
    console.warn('Failed to store recommendations:', recError);
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      ...recommendations,
      sourceCount: relevantEntries.length,
      searchSummary: searchData?.summary
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Web crawl with Universal AI processing
 */
async function webCrawl(params: any) {
  const { startUrl, maxPages = 5, category, userId } = params;
  
  console.log(`🕷️ Starting web crawl from: ${startUrl}`);
  
  const crawledUrls = new Set<string>();
  const results: any[] = [];
  
  await crawlUrlRecursive(startUrl, crawledUrls, results, maxPages, category, userId);
  
  return new Response(
    JSON.stringify({ 
      success: true,
      crawledPages: results.length,
      urls: Array.from(crawledUrls),
      message: 'Web crawl completed with AI processing'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============ Universal AI Helper Functions ============

/**
 * Classify content using Universal AI (ai-universal-processor)
 */
async function classifyWithUniversalAI(content: string, context?: any): Promise<any> {
  if (!content || content.length < 10) return null;
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Classify this healthcare/biotech content:

CONTENT:
${content.substring(0, 2000)}

${context ? `CONTEXT: ${JSON.stringify(context)}` : ''}

Return JSON with:
{
  "primaryCategory": "main category (e.g., cell_therapy, gene_therapy, diagnostics, clinical_protocols)",
  "secondaryCategories": ["list", "of", "related", "categories"],
  "domain": "healthcare domain (oncology, cardiology, neurology, etc.)",
  "treatmentCategory": "treatment type if applicable",
  "regulatoryStatus": "approved|investigational|research|unknown",
  "evidenceLevel": "high|moderate|low|unknown",
  "confidence": 0.0-1.0
}`,
        systemPrompt: 'You are a medical content classifier. Analyze and categorize healthcare content accurately. Return only valid JSON.',
        temperature: 0.2,
        maxTokens: 400
      }
    });

    if (error) {
      console.warn('Classification failed:', error);
      return null;
    }

    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (error) {
    console.error('Classification error:', error);
    return null;
  }
}

/**
 * Extract entities using Universal AI
 */
async function extractEntitiesWithUniversalAI(content: string, entityTypes?: string[]): Promise<any> {
  if (!content || content.length < 10) return null;
  
  const defaultTypes = ['diseases', 'treatments', 'drugs', 'genes', 'proteins', 'organizations', 'clinical_trials'];
  const types = entityTypes || defaultTypes;
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Extract medical/scientific entities from this content:

CONTENT:
${content.substring(0, 2000)}

ENTITY TYPES TO EXTRACT: ${types.join(', ')}

Return JSON with:
{
  "title": "extracted or inferred title",
  "entities": {
    "diseases": ["list of diseases/conditions mentioned"],
    "treatments": ["list of treatments/therapies"],
    "drugs": ["list of drugs/medications"],
    "genes": ["list of genes"],
    "proteins": ["list of proteins"],
    "organizations": ["list of organizations/institutions"],
    "clinical_trials": ["list of clinical trial identifiers"]
  },
  "healthcareTags": ["relevant healthcare tags"],
  "keyTerms": ["important medical terms"],
  "relationships": [{"entity1": "name", "relation": "treats/causes/targets", "entity2": "name"}]
}`,
        systemPrompt: 'You are a medical entity extraction specialist. Extract entities accurately from healthcare content. Return only valid JSON.',
        temperature: 0.1,
        maxTokens: 600
      }
    });

    if (error) {
      console.warn('Entity extraction failed:', error);
      return null;
    }

    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (error) {
    console.error('Entity extraction error:', error);
    return null;
  }
}

/**
 * Summarize content using Universal AI
 */
async function summarizeWithUniversalAI(content: string, maxWords: number = 100): Promise<string | null> {
  if (!content || content.length < 50) return null;
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Summarize this healthcare/biotech content in ${maxWords} words or less:

${content.substring(0, 3000)}

Provide a clear, accurate summary focusing on:
- Key findings or information
- Clinical relevance if applicable
- Main takeaways`,
        systemPrompt: 'You are a medical content summarizer. Create accurate, concise summaries of healthcare content.',
        temperature: 0.3,
        maxTokens: Math.ceil(maxWords * 1.5)
      }
    });

    if (error) {
      console.warn('Summarization failed:', error);
      return null;
    }

    return data.content?.trim() || null;

  } catch (error) {
    console.error('Summarization error:', error);
    return null;
  }
}

/**
 * Generate AI-powered recommendations
 */
async function generateAIRecommendations(query: string, entries: any[], context: any): Promise<any> {
  if (entries.length === 0) {
    return {
      recommendations: [],
      nextBestActions: [],
      treatmentRecommendations: [],
      clinicalInsights: null,
      confidence: 0
    };
  }

  const entrySummary = entries.slice(0, 5).map((e: any) => 
    `- ${e.document.title}: ${e.document.content?.substring(0, 200)}`
  ).join('\n');

  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Generate healthcare recommendations based on this query and knowledge:

QUERY: "${query}"

RELEVANT KNOWLEDGE:
${entrySummary}

${context ? `HEALTHCARE CONTEXT: ${JSON.stringify(context)}` : ''}

Return JSON with:
{
  "recommendations": [
    {"type": "category", "title": "recommendation title", "description": "details", "confidence": 0.0-1.0, "priority": "high|medium|low"}
  ],
  "nextBestActions": [
    {"action": "action_id", "priority": "high|medium|low", "description": "what to do", "timeline": "when"}
  ],
  "treatmentRecommendations": [
    {"modality": "treatment type", "treatment": "specific treatment", "evidence_level": "high|moderate|low", "considerations": "notes"}
  ],
  "clinicalInsights": {
    "key_findings": ["list of findings"],
    "evidence_strength": "high|moderate|low",
    "clinical_relevance": "high|moderate|low",
    "research_gaps": ["gaps identified"]
  },
  "confidence": 0.0-1.0
}`,
        systemPrompt: 'You are a clinical decision support system. Generate accurate, evidence-based recommendations. Return only valid JSON.',
        temperature: 0.3,
        maxTokens: 800
      }
    });

    if (error) {
      console.warn('Recommendation generation failed:', error);
      return generateFallbackRecommendations(query, entries, context);
    }

    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackRecommendations(query, entries, context);

  } catch (error) {
    console.error('Recommendation error:', error);
    return generateFallbackRecommendations(query, entries, context);
  }
}

/**
 * Fallback recommendations when AI fails
 */
function generateFallbackRecommendations(query: string, entries: any[], context: any) {
  return {
    recommendations: entries.slice(0, 3).map((e: any) => ({
      type: 'knowledge_based',
      title: e.document.title,
      description: e.document.content?.substring(0, 200) || '',
      confidence: e.similarity || 0.7,
      priority: 'medium'
    })),
    nextBestActions: [
      { action: 'review_findings', priority: 'high', description: 'Review the relevant findings', timeline: 'immediate' }
    ],
    treatmentRecommendations: [],
    clinicalInsights: {
      key_findings: entries.slice(0, 3).map((e: any) => e.document.title),
      evidence_strength: 'moderate',
      clinical_relevance: 'medium',
      research_gaps: []
    },
    confidence: 0.6
  };
}

// ============ Utility Functions ============

function processTextContent(content: string, sourceType: string): string {
  if (!content) return '';
  
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitleFromHtml(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function inferTreatmentCategory(content: string, category: string): string {
  if (category === 'cell_therapy') return 'cellular_therapeutics';
  if (category === 'gene_therapy') return 'genetic_medicine';
  return 'general_treatment';
}

function inferRegulatoryStatus(content: string): string {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('fda approved')) return 'approved';
  if (lowerContent.includes('clinical trial')) return 'investigational';
  return 'research';
}

async function crawlUrlRecursive(
  url: string, 
  visited: Set<string>, 
  results: any[], 
  maxPages: number, 
  category: string, 
  userId: string
) {
  if (visited.size >= maxPages || visited.has(url)) return;
  
  visited.add(url);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const textContent = extractTextFromHtml(html);
    const title = extractTitleFromHtml(html);
    
    // Use Universal AI for processing
    const [classification, summary] = await Promise.all([
      classifyWithUniversalAI(textContent),
      summarizeWithUniversalAI(textContent, 100)
    ]);
    
    const knowledgeData = {
      name: title || url,
      description: summary || `Crawled from ${url}`,
      category: classification?.primaryCategory || category || 'general',
      source_type: 'web_crawl',
      source_url: url,
      content_type: 'html',
      raw_content: html,
      processed_content: textContent,
      healthcare_tags: classification?.secondaryCategories || [],
      created_by: userId,
      metadata: {
        crawl_timestamp: new Date().toISOString(),
        ai_classification: classification
      }
    };

    const { data } = await supabase
      .from('knowledge_base')
      .insert(knowledgeData)
      .select()
      .single();

    if (data) results.push(data);
    
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
  }
}
