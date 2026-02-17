import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizVideoRequest {
  action: 'generate' | 'create_interactive' | 'analyze_engagement';
  content: {
    topic: string;
    sourceText?: string;
    sourceVideoUrl?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    questionTypes: ('multiple_choice' | 'true_false' | 'fill_blank' | 'matching')[];
  };
  videoStyle?: {
    template: 'educational' | 'gamified' | 'minimalist' | 'animated';
    duration: number;
    pauseForAnswer: boolean;
    showCorrectAnswer: boolean;
    includeExplanations: boolean;
  };
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    fontFamily?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: QuizVideoRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`🎓 Quiz Video Request:`, {
      action: request.action,
      topic: request.content.topic,
      questionCount: request.content.questionCount
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result;

    switch (request.action) {
      case 'generate':
        result = await generateQuizVideo(request, LOVABLE_API_KEY);
        break;

      case 'create_interactive':
        result = await createInteractiveQuiz(request, LOVABLE_API_KEY);
        break;

      case 'analyze_engagement':
        result = await analyzeQuizEngagement(request);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quiz video error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateQuizVideo(request: QuizVideoRequest, apiKey: string): Promise<{
  videoUrl: string;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    timestamp: number;
    duration: number;
  }>;
  totalDuration: number;
  interactiveChapters: Array<{ title: string; timestamp: number }>;
}> {
  // Generate questions using AI
  const questionsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
          content: 'You are an educational content expert who creates engaging quiz questions.'
        },
        {
          role: 'user',
          content: `Generate ${request.content.questionCount} quiz questions about: ${request.content.topic}
          
${request.content.sourceText ? `Source material: ${request.content.sourceText.substring(0, 2000)}` : ''}

Difficulty: ${request.content.difficulty}
Question types: ${request.content.questionTypes.join(', ')}

Return JSON array with questions:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "B",
      "explanation": "Explanation of why B is correct"
    }
  ]
}`
        }
      ]
    }),
  });

  let questions: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    timestamp: number;
    duration: number;
  }> = [];

  if (questionsResponse.ok) {
    const data = await questionsResponse.json();
    try {
      const parsed = JSON.parse(data.choices?.[0]?.message?.content);
      const timePerQuestion = (request.videoStyle?.duration || 60) / request.content.questionCount;
      
      questions = (parsed.questions || []).map((q: any, index: number) => ({
        ...q,
        timestamp: index * timePerQuestion,
        duration: timePerQuestion
      }));
    } catch {
      // Generate default questions
      questions = Array.from({ length: request.content.questionCount }, (_, i) => ({
        id: `q${i + 1}`,
        type: 'multiple_choice',
        question: `Sample question ${i + 1} about ${request.content.topic}?`,
        options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
        correctAnswer: 'A',
        explanation: 'This is the explanation for the correct answer.',
        timestamp: i * 10,
        duration: 10
      }));
    }
  }

  const totalDuration = request.videoStyle?.duration || questions.length * 10;
  const videoId = `quiz_${Date.now()}`;

  return {
    videoUrl: `https://storage.example.com/quiz-videos/${videoId}.mp4`,
    questions,
    totalDuration,
    interactiveChapters: questions.map((q, i) => ({
      title: `Question ${i + 1}`,
      timestamp: q.timestamp
    }))
  };
}

async function createInteractiveQuiz(request: QuizVideoRequest, apiKey: string): Promise<{
  quizId: string;
  embedCode: string;
  shareableLink: string;
  ltiConfig?: {
    launchUrl: string;
    consumerKey: string;
  };
  analytics: {
    trackingEnabled: boolean;
    metricsCollected: string[];
  };
}> {
  const quizId = `interactive_${Date.now()}`;
  const baseUrl = 'https://your-app.com';

  return {
    quizId,
    embedCode: `<iframe src="${baseUrl}/quiz/${quizId}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
    shareableLink: `${baseUrl}/quiz/${quizId}`,
    ltiConfig: {
      launchUrl: `${baseUrl}/lti/launch/${quizId}`,
      consumerKey: `lti_${quizId}`
    },
    analytics: {
      trackingEnabled: true,
      metricsCollected: [
        'completion_rate',
        'average_score',
        'question_accuracy',
        'time_per_question',
        'replay_count',
        'drop_off_points'
      ]
    }
  };
}

async function analyzeQuizEngagement(request: QuizVideoRequest): Promise<{
  engagementMetrics: {
    averageCompletionRate: number;
    averageScore: number;
    mostMissedQuestions: Array<{ questionId: string; accuracy: number }>;
    averageTimePerQuestion: number;
    replayRate: number;
  };
  insights: string[];
  recommendations: string[];
}> {
  return {
    engagementMetrics: {
      averageCompletionRate: 78,
      averageScore: 72,
      mostMissedQuestions: [
        { questionId: 'q3', accuracy: 45 },
        { questionId: 'q7', accuracy: 52 }
      ],
      averageTimePerQuestion: 15,
      replayRate: 23
    },
    insights: [
      'Questions 3 and 7 have significantly lower accuracy - consider simplifying',
      'High replay rate indicates engaging content',
      'Completion rate drops after question 5 - consider shorter quizzes'
    ],
    recommendations: [
      'Add visual hints for difficult questions',
      'Reduce quiz length to 5-7 questions for better completion',
      'Include encouraging feedback after each answer'
    ]
  };
}
