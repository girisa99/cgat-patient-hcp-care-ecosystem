import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, limit = 10 } = await req.json();
    
    console.log('Visual Content Search Request:', { query, category, limit });

    // Mock visual content from various scientific sources
    // In production, this would integrate with actual APIs
    const mockVisualContent = [
      // YouTube Sources
      {
        id: 'yt_nature_1',
        title: 'CAR-T Cell Therapy: The Future of Cancer Treatment',
        description: 'Nature Video explains how CAR-T cell therapy is revolutionizing cancer treatment with detailed animations.',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        thumbnailUrl: 'https://img.youtube.com/vi/example1/maxresdefault.jpg',
        sourceType: 'youtube',
        sourceName: 'Nature Video',
        publishedDate: '2024-01-15',
        tags: ['CAR-T', 'immunotherapy', 'cancer', 'cell therapy'],
        relevanceScore: 0.95
      },
      {
        id: 'yt_stat_1',
        title: 'Latest CAR-T Clinical Trial Results',
        description: 'STAT News reports on breakthrough clinical trial results for CAR-T therapies.',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        thumbnailUrl: 'https://img.youtube.com/vi/example2/maxresdefault.jpg',
        sourceType: 'youtube',
        sourceName: 'STAT News',
        publishedDate: '2024-02-10',
        tags: ['clinical trials', 'CAR-T', 'FDA approval'],
        relevanceScore: 0.88
      },
      {
        id: 'yt_science_1',
        title: 'How CAR-T Cells Find and Destroy Cancer',
        description: 'Science Magazine visualization of CAR-T cell mechanisms and pathways.',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        thumbnailUrl: 'https://img.youtube.com/vi/example3/maxresdefault.jpg',
        sourceType: 'youtube',
        sourceName: 'Science Magazine',
        publishedDate: '2024-01-28',
        tags: ['molecular biology', 'T cells', 'cancer mechanisms'],
        relevanceScore: 0.92
      },
      
      // Website Infographics
      {
        id: 'nih_infographic_1',
        title: 'CAR-T Cell Therapy Process Infographic',
        description: 'NIH comprehensive infographic showing the complete CAR-T therapy process from T-cell collection to patient reinfusion.',
        imageUrl: 'https://www.nih.gov/sites/default/files/cart-therapy-infographic.png',
        thumbnailUrl: 'https://www.nih.gov/sites/default/files/cart-therapy-thumb.png',
        sourceType: 'infographic',
        sourceName: 'NIH.gov',
        publishedDate: '2023-11-20',
        tags: ['CAR-T process', 'immunotherapy', 'FDA approved'],
        relevanceScore: 0.89
      },
      {
        id: 'cell_press_1',
        title: 'CAR-T Cell Engineering Diagram',
        description: 'Cell Press visual resource showing detailed CAR construct design and T-cell modification process.',
        imageUrl: 'https://cellpress.com/cart-engineering-diagram.jpg',
        thumbnailUrl: 'https://cellpress.com/cart-engineering-thumb.jpg',
        sourceType: 'research_paper',
        sourceName: 'Cell Press',
        publishedDate: '2024-01-05',
        tags: ['genetic engineering', 'CAR design', 'T cell modification'],
        relevanceScore: 0.94
      },
      {
        id: 'sciam_graphic_1',
        title: 'CAR-T Success Rates by Cancer Type',
        description: 'Scientific American interactive graphic showing CAR-T therapy success rates across different cancer types.',
        imageUrl: 'https://scientificamerican.com/cart-success-rates.svg',
        thumbnailUrl: 'https://scientificamerican.com/cart-success-thumb.svg',
        sourceType: 'infographic',
        sourceName: 'Scientific American',
        publishedDate: '2024-02-01',
        tags: ['success rates', 'cancer types', 'clinical outcomes'],
        relevanceScore: 0.86
      },
      
      // Additional Research Content
      {
        id: 'nature_research_1',
        title: 'CAR-T Cell Persistence and Efficacy Data',
        description: 'Research visualization showing long-term CAR-T cell persistence in patients.',
        imageUrl: 'https://nature.com/articles/cart-persistence-data.png',
        thumbnailUrl: 'https://nature.com/articles/cart-persistence-thumb.png',
        sourceType: 'research_paper',
        sourceName: 'Nature Medicine',
        publishedDate: '2024-01-12',
        tags: ['persistence', 'efficacy', 'long-term outcomes'],
        relevanceScore: 0.91
      },
      {
        id: 'fda_guidance_visual',
        title: 'FDA CAR-T Regulatory Pathway',
        description: 'Visual guide to FDA regulatory requirements for CAR-T cell therapies.',
        imageUrl: 'https://fda.gov/cart-regulatory-pathway.pdf',
        thumbnailUrl: 'https://fda.gov/cart-regulatory-thumb.png',
        sourceType: 'website',
        sourceName: 'FDA.gov',
        publishedDate: '2023-12-15',
        tags: ['FDA approval', 'regulatory', 'compliance'],
        relevanceScore: 0.83
      }
    ];

    let filteredResults = mockVisualContent;

    // Filter by query if provided
    if (query) {
      filteredResults = mockVisualContent.filter(content => 
        content.title.toLowerCase().includes(query.toLowerCase()) ||
        content.description.toLowerCase().includes(query.toLowerCase()) ||
        content.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by category if provided
    if (category) {
      const categoryMap = {
        'medical': ['CAR-T', 'immunotherapy', 'cancer', 'clinical trials'],
        'research': ['molecular biology', 'genetic engineering', 'T cell modification'],
        'regulatory': ['FDA approval', 'regulatory', 'compliance'],
        'outcomes': ['success rates', 'efficacy', 'clinical outcomes']
      };
      
      const categoryTags = categoryMap[category] || [];
      if (categoryTags.length > 0) {
        filteredResults = filteredResults.filter(content =>
          content.tags.some(tag => 
            categoryTags.some(catTag => tag.toLowerCase().includes(catTag.toLowerCase()))
          )
        );
      }
    }

    // Sort by relevance score and limit results
    filteredResults = filteredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    console.log('Visual Content Search Results:', { count: filteredResults.length });

    return new Response(JSON.stringify({ 
      sources: filteredResults,
      query: query || category,
      totalFound: filteredResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Visual Content Search Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Visual content search failed',
      sources: [],
      totalFound: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});