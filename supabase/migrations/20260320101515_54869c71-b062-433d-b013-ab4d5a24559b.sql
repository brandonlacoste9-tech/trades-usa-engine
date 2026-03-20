
-- Create enum types
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE public.trade_type AS ENUM ('hvac', 'plumbing', 'electrical', 'roofing', 'general_contracting', 'landscaping', 'solar', 'pool', 'hurricane_protection', 'renovations', 'other');
CREATE TYPE public.subscription_plan AS ENUM ('web_starter', 'lead_engine', 'market_dominator', 'empire_builder');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  trade trade_type,
  state TEXT,
  city TEXT,
  zip_code TEXT,
  subscription_plan subscription_plan DEFAULT 'web_starter',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  trade trade_type,
  project_type TEXT,
  state TEXT,
  city TEXT,
  zip_code TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'website',
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contractors can view own leads" ON public.leads FOR SELECT USING (auth.uid() = contractor_id);
CREATE POLICY "Contractors can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = contractor_id);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_leads_contractor ON public.leads(contractor_id);
CREATE INDEX idx_leads_zip ON public.leads(zip_code);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contractors can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = contractor_id);
CREATE POLICY "Contractors can manage own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = contractor_id);
CREATE POLICY "Contractors can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = contractor_id);
CREATE POLICY "Contractors can delete own appointments" ON public.appointments FOR DELETE USING (auth.uid() = contractor_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scraped inventory (permits)
CREATE TABLE public.scraped_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_number TEXT,
  description TEXT,
  project_type TEXT,
  estimated_value NUMERIC,
  address TEXT,
  state TEXT,
  city TEXT,
  zip_code TEXT,
  owner_name TEXT,
  owner_contact TEXT,
  scraped_source TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scraped_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view permits" ON public.scraped_inventory FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_permits_zip ON public.scraped_inventory(zip_code);
CREATE INDEX idx_permits_state ON public.scraped_inventory(state);

-- Automated logs
CREATE TABLE public.automated_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email',
  event_type TEXT NOT NULL,
  recipient TEXT,
  subject TEXT,
  status TEXT DEFAULT 'sent',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automated_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contractors can view own logs" ON public.automated_logs FOR SELECT USING (auth.uid() = contractor_id);
