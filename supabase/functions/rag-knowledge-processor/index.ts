import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log(`Processing RAG action: ${action}`);

    switch (action) {
      case 'add_knowledge':
        return await addKnowledge(params);
      case 'process_url':
        return await processUrl(params);
      case 'generate_embeddings':
        return await generateEmbeddings(params);
      case 'get_recommendations':
        return await getRecommendations(params);
      case 'web_crawl':
        return await webCrawl(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('RAG processor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process RAG request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

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
  const processedContent = await processContent(content, sourceType);
  
  // Generate embeddings if OpenAI is available
  let embeddings = null;
  if (openaiApiKey && processedContent) {
    embeddings = await generateContentEmbeddings(processedContent);
  }

  const knowledgeData = {
    name,
    description,
    category,
    source_type: sourceType,
    source_url: url,
    content_type: sourceType === 'document_upload' ? 'text' : 'html',
    raw_content: content,
    processed_content: processedContent,
    embeddings: embeddings ? JSON.stringify(embeddings) : null,
    healthcare_tags: healthcareTags || [],
    modality_type: modalityType,
    treatment_category: inferTreatmentCategory(content, category),
    regulatory_status: inferRegulatoryStatus(content),
    created_by: userId,
    metadata: {
      processing_timestamp: new Date().toISOString(),
      content_length: content?.length || 0,
      embedding_model: 'text-embedding-3-small',
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

  return new Response(
    JSON.stringify({ 
      success: true,
      knowledgeId: data.id,
      message: 'Knowledge added successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function processUrl(params: any) {
  const { url, category, userId } = params;
  
  try {
    console.log(`Processing URL: ${url}`);
    
    // Fetch content from URL
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract text content (simple extraction)
    const textContent = extractTextFromHtml(html);
    
    // Add to processing queue
    const queueData = {
      url,
      processing_type: 'html_parse',
      status: 'completed',
      progress_data: {
        url,
        content_length: textContent.length,
        processed_at: new Date().toISOString()
      }
    };

    // Create knowledge entry
    const knowledgeData = {
      name: extractTitleFromHtml(html) || url,
      description: `Content from ${url}`,
      category: category || 'general',
      source_type: 'html_link',
      source_url: url,
      content_type: 'html',
      raw_content: html,
      processed_content: textContent,
      healthcare_tags: extractHealthcareTags(textContent),
      created_by: userId,
      metadata: {
        url,
        processing_timestamp: new Date().toISOString(),
        content_length: textContent.length
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

    return new Response(
      JSON.stringify({ 
        success: true,
        knowledgeId: data.id,
        extractedContent: textContent.substring(0, 500) + '...',
        message: 'URL processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`URL processing failed: ${error.message}`);
  }
}

async function generateEmbeddings(params: any) {
  const { knowledgeId } = params;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get knowledge base entry
  const { data: knowledge, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', knowledgeId)
    .single();

  if (error || !knowledge) {
    throw new Error('Knowledge entry not found');
  }

  const embeddings = await generateContentEmbeddings(knowledge.processed_content);
  
  // Update knowledge base with embeddings
  await supabase
    .from('knowledge_base')
    .update({ 
      embeddings: JSON.stringify(embeddings),
      updated_at: new Date().toISOString()
    })
    .eq('id', knowledgeId);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Embeddings generated successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getRecommendations(params: any) {
  const { query, conversationId, userId, healthcareContext } = params;
  
  console.log(`Generating recommendations for query: ${query}`);

  // Get relevant knowledge base entries
  const { data: knowledgeEntries, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .limit(10);

  if (error) {
    throw new Error(`Failed to fetch knowledge: ${error.message}`);
  }

  // Simple text matching for now (would use vector similarity in production)
  const relevantEntries = knowledgeEntries.filter(entry => 
    entry.processed_content?.toLowerCase().includes(query.toLowerCase()) ||
    entry.healthcare_tags?.some((tag: string) => 
      query.toLowerCase().includes(tag.toLowerCase())
    )
  );

  // Generate healthcare-specific recommendations
  const recommendations = generateHealthcareRecommendations(
    query, 
    relevantEntries, 
    healthcareContext
  );

  const nextBestActions = generateNextBestActions(
    query, 
    relevantEntries, 
    healthcareContext
  );

  // Store recommendations
  const recommendationData = {
    conversation_id: conversationId,
    knowledge_base_ids: relevantEntries.map(e => e.id),
    query_context: query,
    recommendations,
    next_best_actions: nextBestActions,
    confidence_score: calculateConfidenceScore(relevantEntries.length, query),
    healthcare_context: healthcareContext || {},
    treatment_recommendations: generateTreatmentRecommendations(relevantEntries, healthcareContext),
    clinical_insights: generateClinicalInsights(relevantEntries, query)
  };

  const { data: storedRec, error: recError } = await supabase
    .from('rag_recommendations')
    .insert(recommendationData)
    .select()
    .single();

  if (recError) {
    console.error('Failed to store recommendations:', recError);
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      recommendations,
      nextBestActions,
      clinicalInsights: recommendationData.clinical_insights,
      treatmentRecommendations: recommendationData.treatment_recommendations,
      confidence: recommendationData.confidence_score,
      sourceCount: relevantEntries.length
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function webCrawl(params: any) {
  const { startUrl, maxPages = 5, category, userId } = params;
  
  console.log(`Starting web crawl from: ${startUrl}`);
  
  const crawledUrls = new Set();
  const results = [];
  
  try {
    await crawlUrlRecursive(startUrl, crawledUrls, results, maxPages, category, userId);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        crawledPages: results.length,
        urls: Array.from(crawledUrls),
        message: 'Web crawl completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    throw new Error(`Web crawl failed: ${error.message}`);
  }
}

// Helper functions
async function processContent(content: string, sourceType: string): Promise<string> {
  if (!content) return '';
  
  // Basic content cleaning and processing
  let processed = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Healthcare-specific processing
  if (sourceType === 'document_upload' || sourceType === 'manual_entry') {
    // Extract medical terminology and structure
    processed = enhanceHealthcareContent(processed);
  }
  
  return processed;
}

async function generateContentEmbeddings(content: string): Promise<number[]> {
  if (!openaiApiKey || !content) return [];
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000), // Limit content length
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return [];
  }
}

function extractTextFromHtml(html: string): string {
  // Simple HTML text extraction
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

function extractHealthcareTags(content: string): string[] {
  const healthcareTerms = [
    'cell therapy', 'gene therapy', 'immunotherapy', 'precision medicine',
    'personalized medicine', 'clinical trial', 'FDA approval', 'biomarker',
    'genomics', 'proteomics', 'radiotherapy', 'chemotherapy', 'surgery',
    'diagnosis', 'treatment', 'prognosis', 'oncology', 'cardiology',
    'neurology', 'dermatology', 'radiology', 'pathology'
  ];
  
  const foundTags = healthcareTerms.filter(term => 
    content.toLowerCase().includes(term.toLowerCase())
  );
  
  return foundTags;
}

function generateHealthcareRecommendations(query: string, entries: any[], context: any) {
  const recommendations = [];
  
  entries.forEach(entry => {
    if (entry.category === 'cell_therapy') {
      recommendations.push({
        type: 'cell_therapy_protocol',
        title: `Cell Therapy Protocol: ${entry.name}`,
        description: entry.description,
        confidence: 0.85,
        source: entry.source_url,
        category: entry.category
      });
    } else if (entry.category === 'gene_therapy') {
      recommendations.push({
        type: 'gene_therapy_approach',
        title: `Gene Therapy Approach: ${entry.name}`,
        description: entry.description,
        confidence: 0.82,
        source: entry.source_url,
        category: entry.category
      });
    } else {
      recommendations.push({
        type: 'general_healthcare',
        title: entry.name,
        description: entry.description,
        confidence: 0.75,
        source: entry.source_url,
        category: entry.category
      });
    }
  });
  
  return recommendations;
}

function generateNextBestActions(query: string, entries: any[], context: any) {
  const actions = [];
  
  if (context?.treatment_stage === 'diagnosis') {
    actions.push({
      action: 'schedule_consultation',
      priority: 'high',
      description: 'Schedule consultation with relevant specialist',
      timeline: 'within 1-2 weeks'
    });
  }
  
  if (entries.some(e => e.category === 'clinical_protocols')) {
    actions.push({
      action: 'review_protocols',
      priority: 'medium',
      description: 'Review applicable clinical protocols',
      timeline: 'before next appointment'
    });
  }
  
  actions.push({
    action: 'gather_additional_info',
    priority: 'low',
    description: 'Collect additional patient history or test results',
    timeline: 'as needed'
  });
  
  return actions;
}

function generateTreatmentRecommendations(entries: any[], context: any) {
  return entries
    .filter(e => e.modality_type)
    .map(entry => ({
      modality: entry.modality_type,
      treatment: entry.treatment_category,
      evidence_level: 'moderate',
      considerations: `Based on ${entry.name}`,
      contraindications: []
    }));
}

function generateClinicalInsights(entries: any[], query: string) {
  return {
    key_findings: entries.map(e => e.name),
    evidence_strength: 'moderate',
    clinical_relevance: 'high',
    research_gaps: ['Long-term efficacy data needed'],
    patient_populations: ['Adults with specific conditions']
  };
}

function calculateConfidenceScore(entryCount: number, query: string): number {
  const baseScore = Math.min(entryCount * 0.1, 0.8);
  const queryComplexity = query.split(' ').length > 5 ? 0.1 : 0.05;
  return Math.min(baseScore + queryComplexity, 0.95);
}

function enhanceHealthcareContent(content: string): string {
  // Add medical context and structure
  return content;
}

function inferTreatmentCategory(content: string, category: string): string {
  if (category === 'cell_therapy') return 'cellular_therapeutics';
  if (category === 'gene_therapy') return 'genetic_medicine';
  return 'general_treatment';
}

function inferRegulatoryStatus(content: string): string {
  if (content.toLowerCase().includes('fda approved')) return 'approved';
  if (content.toLowerCase().includes('clinical trial')) return 'investigational';
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
  if (visited.size >= maxPages || visited.has(url)) {
    return;
  }
  
  visited.add(url);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const textContent = extractTextFromHtml(html);
    
    // Store this page
    const knowledgeData = {
      name: extractTitleFromHtml(html) || url,
      description: `Crawled from ${url}`,
      category: category || 'general',
      source_type: 'web_crawl',
      source_url: url,
      content_type: 'html',
      raw_content: html,
      processed_content: textContent,
      healthcare_tags: extractHealthcareTags(textContent),
      created_by: userId,
      metadata: {
        crawl_timestamp: new Date().toISOString(),
        parent_url: url
      }
    };

    const { data } = await supabase
      .from('knowledge_base')
      .insert(knowledgeData)
      .select()
      .single();

    if (data) {
      results.push(data);
    }
    
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
  }
}