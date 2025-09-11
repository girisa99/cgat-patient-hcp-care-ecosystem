import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Label Studio Search Request:', { query });

    // Mock Label Studio annotations related to CAR-T therapy
    const mockAnnotations = [
      'Annotation: CAR-T modalities include CD19, CD22, and BCMA targeting strategies',
      'Annotation: Commercial CAR-T products require specialized manufacturing and cold chain logistics',
      'Annotation: Patient eligibility criteria include adequate organ function and performance status',
      'Annotation: Cytokine Release Syndrome (CRS) is a common side effect requiring monitoring',
      'Annotation: Neurotoxicity management protocols are essential for CAR-T therapy centers'
    ];

    // Filter annotations based on query (simple keyword matching)
    const relevantAnnotations = mockAnnotations.filter(annotation =>
      annotation.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().split(' ').some(word => 
        annotation.toLowerCase().includes(word.toLowerCase())
      )
    );

    console.log('Label Studio Search Results:', { count: relevantAnnotations.length });

    return new Response(JSON.stringify({ 
      annotations: relevantAnnotations,
      query,
      source: 'label_studio'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Label Studio Search Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Label Studio search failed',
      annotations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});