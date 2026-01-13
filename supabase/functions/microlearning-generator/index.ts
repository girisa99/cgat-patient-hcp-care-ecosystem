import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MicrolearningRequest {
  action: 'segment' | 'generate_modules' | 'create_pathway';
  sourceContent: {
    type: 'lecture' | 'document' | 'video' | 'text';
    url?: string;
    text?: string;
    title: string;
    duration?: number; // minutes
  };
  options?: {
    targetModuleLength: number; // minutes per module
    maxModules: number;
    includeQuizzes: boolean;
    includeRecap: boolean;
    difficultyProgression: boolean;
    learningObjectives?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: MicrolearningRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`📚 Microlearning Request:`, {
      action: request.action,
      contentType: request.sourceContent.type,
      title: request.sourceContent.title
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result;

    switch (request.action) {
      case 'segment':
        result = await segmentContent(request, LOVABLE_API_KEY);
        break;

      case 'generate_modules':
        result = await generateModules(request, LOVABLE_API_KEY);
        break;

      case 'create_pathway':
        result = await createLearningPathway(request, LOVABLE_API_KEY);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Microlearning error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function segmentContent(request: MicrolearningRequest, apiKey: string): Promise<{
  segments: Array<{
    id: string;
    title: string;
    summary: string;
    startTime?: number;
    endTime?: number;
    keyPoints: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: number;
    prerequisites: string[];
  }>;
  totalSegments: number;
  recommendedOrder: string[];
}> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an instructional design expert who segments educational content into optimal microlearning modules.'
        },
        {
          role: 'user',
          content: `Segment this ${request.sourceContent.type} content into microlearning modules.

Title: ${request.sourceContent.title}
${request.sourceContent.text ? `Content: ${request.sourceContent.text.substring(0, 4000)}` : ''}
${request.sourceContent.duration ? `Duration: ${request.sourceContent.duration} minutes` : ''}
Target module length: ${request.options?.targetModuleLength || 5} minutes

Return JSON with segments array containing:
- id, title, summary
- startTime/endTime (if video)
- keyPoints (array)
- difficulty (beginner/intermediate/advanced)
- estimatedDuration (minutes)
- prerequisites (array of segment ids)`
        }
      ]
    }),
  });

  if (!response.ok) {
    const targetLength = request.options?.targetModuleLength || 5;
    const totalDuration = request.sourceContent.duration || 60;
    const segmentCount = Math.ceil(totalDuration / targetLength);

    return {
      segments: Array.from({ length: segmentCount }, (_, i) => ({
        id: `seg_${i + 1}`,
        title: `Module ${i + 1}: ${request.sourceContent.title}`,
        summary: `Part ${i + 1} of the ${request.sourceContent.title} course`,
        startTime: i * targetLength * 60,
        endTime: (i + 1) * targetLength * 60,
        keyPoints: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
        difficulty: i < segmentCount / 3 ? 'beginner' : i < (2 * segmentCount) / 3 ? 'intermediate' : 'advanced',
        estimatedDuration: targetLength,
        prerequisites: i > 0 ? [`seg_${i}`] : []
      })),
      totalSegments: segmentCount,
      recommendedOrder: Array.from({ length: segmentCount }, (_, i) => `seg_${i + 1}`)
    };
  }

  const data = await response.json();
  try {
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);
    return {
      segments: parsed.segments || [],
      totalSegments: parsed.segments?.length || 0,
      recommendedOrder: parsed.segments?.map((s: any) => s.id) || []
    };
  } catch {
    return { segments: [], totalSegments: 0, recommendedOrder: [] };
  }
}

async function generateModules(request: MicrolearningRequest, apiKey: string): Promise<{
  modules: Array<{
    id: string;
    title: string;
    videoUrl: string;
    transcript: string;
    quiz?: {
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
      }>;
    };
    recap?: string;
    learningObjectives: string[];
    estimatedTime: number;
  }>;
  totalDuration: number;
  completionCriteria: {
    minQuizScore: number;
    requiredModules: string[];
  };
}> {
  const segmentation = await segmentContent(request, apiKey);
  
  const modules = await Promise.all(segmentation.segments.map(async (segment, index) => {
    const moduleId = `module_${Date.now()}_${index}`;
    
    // Generate quiz if requested
    let quiz;
    if (request.options?.includeQuizzes) {
      quiz = {
        questions: [
          {
            question: `What is the main concept in ${segment.title}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'A'
          },
          {
            question: 'Which of the following is true?',
            options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
            correctAnswer: 'B'
          }
        ]
      };
    }

    // Generate recap if requested
    let recap;
    if (request.options?.includeRecap) {
      recap = `Key takeaways from ${segment.title}: ${segment.keyPoints.join('. ')}.`;
    }

    return {
      id: moduleId,
      title: segment.title,
      videoUrl: `https://storage.example.com/modules/${moduleId}.mp4`,
      transcript: segment.summary,
      quiz,
      recap,
      learningObjectives: request.options?.learningObjectives || segment.keyPoints,
      estimatedTime: segment.estimatedDuration
    };
  }));

  return {
    modules,
    totalDuration: modules.reduce((sum, m) => sum + m.estimatedTime, 0),
    completionCriteria: {
      minQuizScore: 70,
      requiredModules: modules.map(m => m.id)
    }
  };
}

async function createLearningPathway(request: MicrolearningRequest, apiKey: string): Promise<{
  pathwayId: string;
  pathwayTitle: string;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    isOptional: boolean;
    estimatedTime: number;
    completionCriteria: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    afterModule: string;
    reward?: string;
  }>;
  estimatedTotalTime: number;
  certificationAvailable: boolean;
}> {
  const modules = await generateModules(request, apiKey);
  const pathwayId = `pathway_${Date.now()}`;

  return {
    pathwayId,
    pathwayTitle: `${request.sourceContent.title} Learning Path`,
    modules: modules.modules.map((m, index) => ({
      id: m.id,
      title: m.title,
      order: index + 1,
      isOptional: index >= modules.modules.length - 2, // Last 2 modules optional
      estimatedTime: m.estimatedTime,
      completionCriteria: 'Complete video and pass quiz with 70%+'
    })),
    milestones: [
      {
        id: 'milestone_1',
        title: 'Getting Started',
        afterModule: modules.modules[0]?.id || '',
        reward: 'Beginner Badge'
      },
      {
        id: 'milestone_2',
        title: 'Halfway There',
        afterModule: modules.modules[Math.floor(modules.modules.length / 2)]?.id || '',
        reward: 'Progress Badge'
      },
      {
        id: 'milestone_3',
        title: 'Course Complete',
        afterModule: modules.modules[modules.modules.length - 1]?.id || '',
        reward: 'Completion Certificate'
      }
    ],
    estimatedTotalTime: modules.totalDuration,
    certificationAvailable: true
  };
}
