-- =====================================================
-- AI Credits System
-- Usage-based credits for AI features across Genie Suite
-- =====================================================

-- AI Credit Packages for one-time purchases
CREATE TABLE ai_credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  price_id TEXT, -- Stripe price ID
  product_id TEXT, -- Stripe product ID
  is_active BOOLEAN DEFAULT true,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  bonus_credits INTEGER DEFAULT 0,
  segment_restrictions TEXT[] DEFAULT '{}', -- Empty means available to all
  feature_restrictions TEXT[] DEFAULT '{}', -- Empty means credits work for all features
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User AI Credits Balance
CREATE TABLE user_ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  credits_used_total INTEGER NOT NULL DEFAULT 0,
  credits_purchased_total INTEGER NOT NULL DEFAULT 0,
  subscription_credits_monthly INTEGER NOT NULL DEFAULT 0, -- Base credits from subscription
  subscription_credits_used INTEGER NOT NULL DEFAULT 0, -- Used this period
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- AI Credit Transactions (ledger)
CREATE TABLE ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'subscription_grant', 'usage', 'refund', 'bonus', 'expiry'
  credits_amount INTEGER NOT NULL, -- Positive for additions, negative for usage
  balance_after INTEGER NOT NULL,
  
  -- Purchase info (for purchases)
  package_id TEXT REFERENCES ai_credit_packages(id),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Usage info (for usage transactions)
  feature_used TEXT, -- 'script_generation', 'tts', 'music_generation', 'ai_edit', etc.
  feature_metadata JSONB DEFAULT '{}', -- Additional context (duration, model used, etc.)
  
  -- General
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Feature Costs Configuration
CREATE TABLE ai_feature_costs (
  id TEXT PRIMARY KEY,
  feature_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  credits_per_unit INTEGER NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'request', -- 'request', 'minute', 'word', 'image'
  category TEXT NOT NULL, -- 'generation', 'voice', 'music', 'analysis'
  is_active BOOLEAN DEFAULT true,
  tier_discounts JSONB DEFAULT '{}', -- {"pro": 20, "business": 10} = percentage discount
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default credit packages
INSERT INTO ai_credit_packages (id, name, description, credits, price_cents, bonus_credits, discount_percent) VALUES
  ('credits_50', 'Credit Pack - 50', 'Quick top-up for occasional use', 50, 499, 0, 0),
  ('credits_150', 'Credit Pack - 150', 'Popular choice for regular creators', 150, 1299, 15, 3),
  ('credits_500', 'Credit Pack - 500', 'Best value for power users', 500, 3999, 75, 10),
  ('credits_1000', 'Creator Bundle - 1000', 'Professional creator pack', 1000, 6999, 200, 20),
  ('credits_2500', 'Studio Bundle - 2500', 'For teams and heavy usage', 2500, 14999, 600, 28);

-- Insert AI feature costs
INSERT INTO ai_feature_costs (id, feature_name, display_name, description, credits_per_unit, unit_type, category) VALUES
  ('script_generation', 'script_generation', 'Script Generation', 'AI-powered script writing for videos', 5, 'request', 'generation'),
  ('tts_standard', 'tts_standard', 'Text-to-Speech (Standard)', 'Standard AI voice generation', 2, 'minute', 'voice'),
  ('tts_premium', 'tts_premium', 'Text-to-Speech (Premium)', 'Premium HD AI voices', 4, 'minute', 'voice'),
  ('voice_clone', 'voice_clone', 'Voice Cloning', 'Clone your voice for TTS', 25, 'request', 'voice'),
  ('music_generation', 'music_generation', 'AI Music Generation', 'Generate background music', 10, 'request', 'music'),
  ('music_track_30s', 'music_track_30s', '30-Second Music Track', 'Short music clip generation', 5, 'request', 'music'),
  ('ai_edit_basic', 'ai_edit_basic', 'AI Edit (Basic)', 'Auto-cut silences, basic cleanup', 3, 'request', 'analysis'),
  ('ai_edit_advanced', 'ai_edit_advanced', 'AI Edit (Advanced)', 'Full AI-powered editing', 8, 'request', 'analysis'),
  ('caption_generation', 'caption_generation', 'Caption Generation', 'Auto-generate captions', 2, 'minute', 'analysis'),
  ('translation', 'translation', 'AI Translation', 'Translate content to other languages', 3, 'minute', 'analysis'),
  ('thumbnail_generation', 'thumbnail_generation', 'Thumbnail Generation', 'AI-generated video thumbnails', 2, 'request', 'generation'),
  ('document_analysis', 'document_analysis', 'Document Analysis', 'AI document processing', 3, 'request', 'analysis');

-- RLS Policies
ALTER TABLE ai_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_costs ENABLE ROW LEVEL SECURITY;

-- Everyone can view packages
CREATE POLICY "Credit packages are viewable by everyone"
ON ai_credit_packages FOR SELECT
USING (is_active = true);

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
ON user_ai_credits FOR SELECT
USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON ai_credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can view feature costs
CREATE POLICY "Feature costs are viewable by everyone"
ON ai_feature_costs FOR SELECT
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_user_ai_credits_user_id ON user_ai_credits(user_id);
CREATE INDEX idx_ai_credit_transactions_user_id ON ai_credit_transactions(user_id);
CREATE INDEX idx_ai_credit_transactions_created_at ON ai_credit_transactions(created_at DESC);
CREATE INDEX idx_ai_credit_transactions_feature ON ai_credit_transactions(feature_used);

-- Function to get or create user credits record
CREATE OR REPLACE FUNCTION get_or_create_user_credits(p_user_id UUID)
RETURNS user_ai_credits AS $$
DECLARE
  v_credits user_ai_credits;
BEGIN
  SELECT * INTO v_credits FROM user_ai_credits WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_ai_credits (user_id, credits_balance)
    VALUES (p_user_id, 10) -- Start with 10 free credits
    RETURNING * INTO v_credits;
  END IF;
  
  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to deduct credits (used by edge functions)
CREATE OR REPLACE FUNCTION deduct_ai_credits(
  p_user_id UUID,
  p_feature_id TEXT,
  p_units INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
  success BOOLEAN,
  credits_deducted INTEGER,
  balance_after INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_feature ai_feature_costs;
  v_credits user_ai_credits;
  v_cost INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get feature cost
  SELECT * INTO v_feature FROM ai_feature_costs WHERE id = p_feature_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Feature not found or inactive'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate total cost
  v_cost := v_feature.credits_per_unit * p_units;
  
  -- Get or create user credits
  SELECT * INTO v_credits FROM user_ai_credits WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO user_ai_credits (user_id, credits_balance)
    VALUES (p_user_id, 10)
    RETURNING * INTO v_credits;
  END IF;
  
  -- Check if user has enough credits
  IF v_credits.credits_balance < v_cost THEN
    RETURN QUERY SELECT false, 0, v_credits.credits_balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;
  
  -- Deduct credits
  v_new_balance := v_credits.credits_balance - v_cost;
  
  UPDATE user_ai_credits
  SET credits_balance = v_new_balance,
      credits_used_total = credits_used_total + v_cost,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO ai_credit_transactions (
    user_id, transaction_type, credits_amount, balance_after,
    feature_used, feature_metadata, description
  ) VALUES (
    p_user_id, 'usage', -v_cost, v_new_balance,
    p_feature_id, p_metadata, 
    format('Used %s credits for %s', v_cost, v_feature.display_name)
  );
  
  RETURN QUERY SELECT true, v_cost, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add credits (used by edge functions after purchase)
CREATE OR REPLACE FUNCTION add_ai_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_transaction_type TEXT,
  p_package_id TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_credits user_ai_credits;
  v_new_balance INTEGER;
BEGIN
  -- Get or create user credits
  SELECT * INTO v_credits FROM user_ai_credits WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO user_ai_credits (user_id, credits_balance)
    VALUES (p_user_id, 0)
    RETURNING * INTO v_credits;
  END IF;
  
  -- Add credits
  v_new_balance := v_credits.credits_balance + p_credits;
  
  UPDATE user_ai_credits
  SET credits_balance = v_new_balance,
      credits_purchased_total = CASE 
        WHEN p_transaction_type = 'purchase' THEN credits_purchased_total + p_credits
        ELSE credits_purchased_total
      END,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO ai_credit_transactions (
    user_id, transaction_type, credits_amount, balance_after,
    package_id, stripe_payment_intent_id, description
  ) VALUES (
    p_user_id, p_transaction_type, p_credits, v_new_balance,
    p_package_id, p_stripe_payment_intent_id, 
    COALESCE(p_description, format('Added %s credits via %s', p_credits, p_transaction_type))
  );
  
  RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;