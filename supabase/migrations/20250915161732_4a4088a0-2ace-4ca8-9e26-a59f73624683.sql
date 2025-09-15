-- Create user_conversations table for storing user information and RAG context
CREATE TABLE IF NOT EXISTS public.user_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  email text NOT NULL,
  conversation_context jsonb DEFAULT '{}'::jsonb,
  rag_context jsonb DEFAULT '{}'::jsonb,
  knowledge_contributions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for user conversations
CREATE POLICY "Users can manage their own conversation data"
ON public.user_conversations
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_conversations_updated_at
    BEFORE UPDATE ON public.user_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create knowledge_base_contributions table for RAG enhancement
CREATE TABLE IF NOT EXISTS public.knowledge_base_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.user_conversations(id) ON DELETE CASCADE,
  contribution_type text NOT NULL DEFAULT 'interaction',
  content_summary text,
  context_sources jsonb DEFAULT '[]'::jsonb,
  rag_enhancement_data jsonb DEFAULT '{}'::jsonb,
  relevance_score numeric DEFAULT 0.0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base_contributions ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge base contributions
CREATE POLICY "Users can view their knowledge contributions"
ON public.knowledge_base_contributions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert knowledge contributions"
ON public.knowledge_base_contributions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_conversations_user_id ON public.user_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_email ON public.user_conversations(email);
CREATE INDEX IF NOT EXISTS idx_knowledge_contributions_user_id ON public.knowledge_base_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_contributions_conversation_id ON public.knowledge_base_contributions(conversation_id);