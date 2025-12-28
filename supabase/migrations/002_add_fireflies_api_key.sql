-- Add Fireflies API Key to User Settings
-- This column stores the user's encrypted Fireflies.ai API key

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS fireflies_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.fireflies_api_key IS 'Encrypted Fireflies.ai API key for meeting transcripts';
