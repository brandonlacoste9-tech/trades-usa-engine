-- Add telegram verification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_verification_code TEXT,
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT;

-- Index for faster lookup of verification codes
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_verification_code 
ON public.profiles(telegram_verification_code);
