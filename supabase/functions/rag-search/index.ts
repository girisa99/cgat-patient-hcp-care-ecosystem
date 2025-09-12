import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 5 } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock RAG search functionality with healthcare/biotech knowledge
    const mockKnowledgeBase = {
      medical: [
        { title: "Cell Therapy Guidelines", content: "CAR-T cell therapy protocols and safety considerations", similarity: 0.85 },
        { title: "Gene Editing Standards", content: "CRISPR-Cas9 therapeutic applications and regulatory framework", similarity: 0.80 },
        { title: "Clinical Trial Design", content: "Phase I/II/III protocols for gene and cell therapies", similarity: 0.75 }
      ],
      general: [
        { title: "Healthcare Regulations", content: "FDA guidelines for biotechnology products", similarity: 0.70 },
        { title: "Research Protocols", content: "Best practices for clinical research documentation", similarity: 0.68 },
        { title: "Safety Monitoring", content: "Adverse event reporting and pharmacovigilance", similarity: 0.65 }
      ]
    };

    // Simple keyword matching for mock results
    const searchTerms = query.toLowerCase().split(' ');
    const results = [];
    
    // Search medical knowledge base
    for (const doc of mockKnowledgeBase.medical) {
      const matchScore = searchTerms.reduce((score, term) => {
        return score + (doc.content.toLowerCase().includes(term) ? 0.1 : 0) +
                      (doc.title.toLowerCase().includes(term) ? 0.2 : 0);
      }, doc.similarity);
      
      if (matchScore > 0.7) {
        results.push({
          document: {
            id: `med_${Math.random().toString(36).substr(2, 9)}`,
            title: doc.title,
            content: doc.content,
            source: 'knowledge_base' as const,
            created_at: new Date().toISOString(),
            metadata: { category: 'medical', relevance: 'high' }
          },
          similarity: matchScore,
          relevantChunks: [doc.content]
        });
      }
    }

    // Search general knowledge base if medical results are insufficient
    if (results.length < limit) {
      for (const doc of mockKnowledgeBase.general) {
        const matchScore = searchTerms.reduce((score, term) => {
          return score + (doc.content.toLowerCase().includes(term) ? 0.1 : 0) +
                        (doc.title.toLowerCase().includes(term) ? 0.2 : 0);
        }, doc.similarity);
        
        if (matchScore > 0.6 && results.length < limit) {
          results.push({
            document: {
              id: `gen_${Math.random().toString(36).substr(2, 9)}`,
              title: doc.title,
              content: doc.content,
              source: 'knowledge_base' as const,
              created_at: new Date().toISOString(),
              metadata: { category: 'general', relevance: 'medium' }
            },
            similarity: matchScore,
            relevantChunks: [doc.content]
          });
        }
      }
    }

    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    const limitedResults = results.slice(0, limit);

    console.log(`RAG search for "${query}" found ${limitedResults.length} results`);

    return new Response(
      JSON.stringify({ 
        results: limitedResults,
        query,
        total: limitedResults.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('RAG search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        results: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});