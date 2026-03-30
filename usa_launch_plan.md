# Implementation Plan: Trades-USA Engine Launch

This plan outlines the steps to launch the American version of the platform, "Trades-USA", by porting existing features from the Canadian site and aligning the database and branding systems.

## 1. Branding & Context Configuration
Sync the branding system to support dynamic switching between USA and Canada.
- [x] Create `src/lib/brandConfig.ts` in `trades-usa-engine` (adapted for Vite/import.meta.env).
- [ ] Replace hardcoded "Trades-USA" and "USD" strings in components with `brand` config values.
- [ ] Update `vite.config.ts` if needed to support environment variable injection.

## 2. Database Schema Alignment (USA Supabase)
Ensure the USA database supports the latest Telegram verification features.
- [ ] Add `telegram_verification_code` (text) to `profiles` table.
- [ ] Add `telegram_bot_token` (text) to `profiles` table.
- [ ] Ensure `telegram_chat_id` exists (it seems it does).
- [ ] Update RLS policies to matching Canadian security standards.

## 3. Port Telegram Verification Flow
Port the automated Telegram verification from Canada to USA.
- [ ] Copy `TelegramOnboardingBanner.tsx` and related UI components.
- [ ] Update `ProfileSettingsCard.tsx` in USA to include the 3-step verification guide.
- [ ] Implement `telegram-bot-webhook` edge function in USA project.
- [ ] Update `telegram-lead-alert` to handle US-based leads (Zip codes, States).

## 4. Environment & Deployment
- [ ] Configure `.env.local` for the USA engine.
- [ ] Set `VITE_BRAND="USA"`.
- [ ] Deploy the USA edge functions.
- [ ] Update Supabase Types in the frontend.

## 5. UI/UX Polish
- [ ] Update the Hero and Features sections to reference "American contractors" and "Elite permits".
- [ ] Verify the "Market Intel" card handles US cities correctly.
