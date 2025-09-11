import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 5 } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('RAG Search Request:', { query, limit });

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For now, simulate RAG search with mock data
    // In production, this would use vector embeddings and similarity search
    const mockResults = [
      {
        document: {
          id: 'doc_1',
          title: 'CAR-T Cell Therapy Guidelines',
          content: 'CAR-T (Chimeric Antigen Receptor T-cell) therapy is a breakthrough immunotherapy treatment...',
          metadata: { category: 'medical', source: 'FDA Guidelines' },
          source: 'knowledge_base',
          created_at: new Date().toISOString()
        },
        similarity: 0.95,
        relevantChunks: [
          'CAR-T therapy involves genetically modifying a patient\'s T-cells to better fight cancer.',
          'Commercial CAR-T products include Kymriah, Yescarta, and Tecartus.',
          'CAR-T therapy is FDA-approved for certain blood cancers and lymphomas.'
        ]
      },
      {
        document: {
          id: 'doc_2',
          title: 'Commercial CAR-T Products Overview',
          content: 'Currently FDA-approved CAR-T cell therapies include multiple commercial products...',
          metadata: { category: 'commercial', source: 'Product Database' },
          source: 'label_studio',
          created_at: new Date().toISOString()
        },
        similarity: 0.88,
        relevantChunks: [
          'Kymriah (tisagenlecleucel) - First FDA-approved CAR-T therapy',
          'Yescarta (axicabtagene ciloleucel) - Approved for large B-cell lymphoma',
          'Tecartus (brexucabtagene autoleucel) - Approved for mantle cell lymphoma'
        ]
      }
    ];

    // Filter results based on query relevance (simple keyword matching for demo)
    const filteredResults = mockResults.filter(result => 
      result.document.title.toLowerCase().includes(query.toLowerCase()) ||
      result.document.content.toLowerCase().includes(query.toLowerCase()) ||
      result.relevantChunks.some(chunk => 
        chunk.toLowerCase().includes(query.toLowerCase())
      )
    ).slice(0, limit);

    console.log('RAG Search Results:', { count: filteredResults.length });

    return new Response(JSON.stringify({ 
      results: filteredResults,
      query,
      totalFound: filteredResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('RAG Search Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'RAG search failed',
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});