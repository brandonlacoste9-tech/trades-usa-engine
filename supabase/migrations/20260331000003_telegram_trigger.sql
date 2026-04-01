-- Enable the HTTP extension to allow sending POST requests from PostgreSQL triggers
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Create the notification function
CREATE OR REPLACE FUNCTION notify_telegram_on_scraped_lead()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  -- We only want to notify for Elite or High tier leads (Hot Leads)
  IF (NEW.heat_tier IN ('elite', 'high')) THEN
    payload := json_build_object(
      'permit', NEW
    );

    -- Call the telegram-notify edge function
    -- Replace <ANON_KEY> with the actual anon key if it's not being picked up by the auth middleware
    PERFORM
      extensions.http_post(
        'https://nwgrqafpgpqxsygrllwa.supabase.co/functions/v1/telegram-notify',
        payload::text,
        'application/json',
        -- This uses the standard anon key for authentication
        '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3JxYWZwZ3BxeHN5Z3JsbHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODgyMjIsImV4cCI6MjA4OTY2NDIyMn0.6HWEl3q2Kt4hjORDoULALB9IEnLOeyHU8j1fIhOlp9k"}'
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up the trigger on the scraped_inventory table
DROP TRIGGER IF EXISTS telegram_alert_on_scraped_lead ON public.scraped_inventory;
CREATE TRIGGER telegram_alert_on_scraped_lead
AFTER INSERT ON public.scraped_inventory
FOR EACH ROW EXECUTE FUNCTION notify_telegram_on_scraped_lead();
