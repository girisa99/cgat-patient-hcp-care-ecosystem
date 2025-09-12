-- Create genie_configurations table to store user preferences
CREATE TABLE public.genie_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  configuration_name text DEFAULT 'default',
  selected_mode text DEFAULT 'system' CHECK (selected_mode IN ('system', 'single', 'multi')),
  selected_models jsonb DEFAULT '[]'::jsonb,
  left_model text DEFAULT 'GEMINI',
  right_model text DEFAULT 'GPT',
  selected_model_type text DEFAULT 'llm' CHECK (selected_model_type IN ('llm', 'slm', 'vlm')),
  enabled_features jsonb DEFAULT '[]'::jsonb,
  selected_mcp_tools jsonb DEFAULT '[]'::jsonb,
  knowledge_base text DEFAULT '',
  medical_context boolean DEFAULT false,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genie_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for genie configurations
CREATE POLICY "Users can view their own genie configurations" 
ON public.genie_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own genie configurations" 
ON public.genie_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genie configurations" 
ON public.genie_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genie configurations" 
ON public.genie_configurations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_genie_configurations_updated_at
BEFORE UPDATE ON public.genie_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create genie_conversations table to persist conversation history
CREATE TABLE public.genie_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  session_name text DEFAULT 'Genie Session',
  messages jsonb DEFAULT '[]'::jsonb,
  configuration_snapshot jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for conversations
ALTER TABLE public.genie_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for genie conversations
CREATE POLICY "Users can view their own genie conversations" 
ON public.genie_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own genie conversations" 
ON public.genie_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genie conversations" 
ON public.genie_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genie conversations" 
ON public.genie_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_genie_conversations_updated_at
BEFORE UPDATE ON public.genie_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();