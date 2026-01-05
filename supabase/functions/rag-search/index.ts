import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { 
      query, 
      limit = 10, 
      category,
      useSemanticReranking = true,
      includeClassification = false,
      includeSummary = false
    } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 RAG search for: "${query}" (limit: ${limit}, category: ${category || 'all'})`);

    // Step 1: Fetch from universal_knowledge_base with keyword matching
    let dbQuery = supabase
      .from('universal_knowledge_base')
      .select('id, finding_name, description, domain, content_type, modality, body_part, finding_category, clinical_significance, key_features, dataset_source')
      .limit(limit * 3); // Fetch more for reranking

    if (category) {
      dbQuery = dbQuery.eq('domain', category);
    }

    const { data: knowledgeEntries, error: dbError } = await dbQuery;

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    if (!knowledgeEntries || knowledgeEntries.length === 0) {
      return new Response(
        JSON.stringify({ 
          results: [], 
          query, 
          total: 0,
          message: 'No knowledge entries found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📚 Found ${knowledgeEntries.length} entries, applying semantic reranking...`);

    // Step 2: Use Universal AI for semantic reranking
    let rankedResults = knowledgeEntries;
    
    if (useSemanticReranking) {
      rankedResults = await semanticRerank(query, knowledgeEntries, limit);
    } else {
      // Basic keyword matching fallback
      rankedResults = keywordMatch(query, knowledgeEntries).slice(0, limit);
    }

    // Step 3: Optional classification of results
    let classification = null;
    if (includeClassification && rankedResults.length > 0) {
      classification = await classifyResults(query, rankedResults);
    }

    // Step 4: Optional summary generation
    let summary = null;
    if (includeSummary && rankedResults.length > 0) {
      summary = await summarizeResults(query, rankedResults);
    }

    // Format results
    const formattedResults = rankedResults.map((entry: any, index: number) => ({
      document: {
        id: entry.id,
        title: entry.finding_name || 'Untitled',
        content: entry.description || '',
        source: 'universal_knowledge_base',
        created_at: new Date().toISOString(),
        metadata: {
          domain: entry.domain,
          contentType: entry.content_type,
          modality: entry.modality,
          bodyPart: entry.body_part,
          category: entry.finding_category,
          clinicalSignificance: entry.clinical_significance,
          datasetSource: entry.dataset_source
        }
      },
      similarity: entry.relevanceScore || (1 - index * 0.05),
      rank: index + 1,
      relevantChunks: [entry.description?.slice(0, 500) || '']
    }));

    console.log(`✅ Returning ${formattedResults.length} ranked results`);

    return new Response(
      JSON.stringify({ 
        results: formattedResults,
        query,
        total: formattedResults.length,
        classification,
        summary,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ RAG search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        results: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Semantic reranking using Universal AI
 */
async function semanticRerank(query: string, entries: any[], limit: number): Promise<any[]> {
  try {
    const entrySummaries = entries.map((e, i) => 
      `[${i}] ${e.finding_name}: ${(e.description || '').slice(0, 200)}`
    ).join('\n');

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `You are a semantic search reranking system. Given a query and a list of documents, rank them by relevance.

QUERY: "${query}"

DOCUMENTS:
${entrySummaries}

Return ONLY a JSON array of document indices ordered by relevance (most relevant first), with relevance scores.
Example: [{"index": 2, "score": 0.95}, {"index": 0, "score": 0.82}, ...]

Return the top ${limit} most relevant documents. If a document is not relevant at all, exclude it.`,
        systemPrompt: 'You are a semantic search expert. Analyze document relevance to queries accurately. Return only valid JSON.',
        temperature: 0.1,
        maxTokens: 500
      }
    });

    if (error) {
      console.warn('Semantic reranking failed, using keyword fallback:', error);
      return keywordMatch(query, entries).slice(0, limit);
    }

    // Parse the ranking response
    const jsonMatch = data.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('Could not parse reranking response, using keyword fallback');
      return keywordMatch(query, entries).slice(0, limit);
    }

    const rankings = JSON.parse(jsonMatch[0]);
    const rerankedEntries = rankings
      .filter((r: any) => r.index >= 0 && r.index < entries.length)
      .slice(0, limit)
      .map((r: any) => ({
        ...entries[r.index],
        relevanceScore: r.score || 0.5
      }));

    return rerankedEntries.length > 0 ? rerankedEntries : keywordMatch(query, entries).slice(0, limit);

  } catch (error) {
    console.error('Semantic reranking error:', error);
    return keywordMatch(query, entries).slice(0, limit);
  }
}

/**
 * Classify search results using Universal AI
 */
async function classifyResults(query: string, results: any[]): Promise<any> {
  try {
    const resultSummary = results.slice(0, 5).map(r => 
      `- ${r.finding_name}: ${(r.description || '').slice(0, 100)}`
    ).join('\n');

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Classify these search results for the query "${query}":

RESULTS:
${resultSummary}

Return JSON with:
{
  "primaryCategory": "main topic category",
  "secondaryCategories": ["list", "of", "related", "categories"],
  "intent": "user search intent (informational/navigational/transactional)",
  "domain": "healthcare domain if applicable",
  "confidence": 0.0-1.0
}`,
        systemPrompt: 'You are a content classifier. Analyze and categorize content accurately. Return only valid JSON.',
        temperature: 0.2,
        maxTokens: 300
      }
    });

    if (error) return null;

    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (error) {
    console.error('Classification error:', error);
    return null;
  }
}

/**
 * Summarize search results using Universal AI
 */
async function summarizeResults(query: string, results: any[]): Promise<string | null> {
  try {
    const resultContent = results.slice(0, 5).map(r => 
      `${r.finding_name}: ${(r.description || '').slice(0, 300)}`
    ).join('\n\n');

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: `Summarize these search results for the query "${query}" in 2-3 sentences:

${resultContent}

Provide a concise, informative summary that answers the user's query based on these results.`,
        systemPrompt: 'You are a helpful summarizer. Create clear, accurate summaries of search results.',
        temperature: 0.3,
        maxTokens: 200
      }
    });

    if (error) return null;
    return data.content?.trim() || null;

  } catch (error) {
    console.error('Summarization error:', error);
    return null;
  }
}

/**
 * Basic keyword matching fallback
 */
function keywordMatch(query: string, entries: any[]): any[] {
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  return entries
    .map(entry => {
      const searchableText = `${entry.finding_name || ''} ${entry.description || ''} ${entry.finding_category || ''}`.toLowerCase();
      
      let score = 0;
      for (const term of queryTerms) {
        if (searchableText.includes(term)) {
          score += term.length > 3 ? 0.2 : 0.1;
        }
      }
      
      return { ...entry, relevanceScore: Math.min(score, 1) };
    })
    .filter(e => e.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
