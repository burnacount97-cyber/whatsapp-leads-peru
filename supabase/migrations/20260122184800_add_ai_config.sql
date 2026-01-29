-- Add AI configuration fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS ai_api_key TEXT,
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS ai_temperature NUMERIC DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS ai_max_tokens INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS ai_system_prompt TEXT DEFAULT 'Eres un asistente virtual amable y profesional que ayuda a capturar leads para un negocio. Tu objetivo es obtener información del cliente de manera natural y amigable.',
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false;

-- Add comment to document the new columns
COMMENT ON COLUMN profiles.ai_provider IS 'AI provider: openai, anthropic, etc.';
COMMENT ON COLUMN profiles.ai_api_key IS 'Encrypted API key for AI provider';
COMMENT ON COLUMN profiles.ai_model IS 'AI model to use (e.g., gpt-4, gpt-3.5-turbo, claude-3)';
COMMENT ON COLUMN profiles.ai_temperature IS 'Temperature for AI responses (0-1)';
COMMENT ON COLUMN profiles.ai_max_tokens IS 'Maximum tokens for AI responses';
COMMENT ON COLUMN profiles.ai_system_prompt IS 'System prompt for AI assistant';
COMMENT ON COLUMN profiles.ai_enabled IS 'Whether AI chatbot is enabled for this client';
