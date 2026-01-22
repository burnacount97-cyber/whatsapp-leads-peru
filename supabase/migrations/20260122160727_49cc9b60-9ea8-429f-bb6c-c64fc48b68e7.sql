-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'staff');

-- Create client status enum
CREATE TYPE public.client_status AS ENUM ('trial', 'active', 'suspended');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Profiles table for clients
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  whatsapp_number TEXT,
  yape_number TEXT DEFAULT '902105668',
  plin_number TEXT DEFAULT '902105668',
  bcp_cci TEXT,
  status client_status DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table for superadmin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Widget configurations per client
CREATE TABLE public.widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  widget_id UUID UNIQUE DEFAULT gen_random_uuid(),
  template TEXT DEFAULT 'general',
  primary_color TEXT DEFAULT '#00C185',
  secondary_color TEXT DEFAULT '#005EB8',
  logo_url TEXT,
  welcome_message TEXT DEFAULT '¡Hola! ¿En qué podemos ayudarte?',
  whatsapp_destination TEXT,
  trigger_delay INTEGER DEFAULT 15,
  trigger_scroll_percent INTEGER DEFAULT 50,
  trigger_exit_intent BOOLEAN DEFAULT true,
  trigger_pages TEXT[] DEFAULT ARRAY['/contacto', '/servicios'],
  niche_question TEXT DEFAULT '¿En qué distrito te encuentras?',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leads captured by widgets
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  widget_id UUID REFERENCES widget_configs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  interest TEXT,
  page_url TEXT,
  trigger_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payments/invoices
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) DEFAULT 30.00,
  payment_method TEXT,
  proof_url TEXT,
  status payment_status DEFAULT 'pending',
  period_start DATE,
  period_end DATE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Widget analytics/visits
CREATE TABLE public.widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES widget_configs(id) ON DELETE CASCADE NOT NULL,
  page_url TEXT,
  visitor_id TEXT,
  event_type TEXT DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Superadmins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'superadmin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Widget configs policies
CREATE POLICY "Users can manage own widget configs"
  ON public.widget_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all widget configs"
  ON public.widget_configs FOR SELECT
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Leads policies
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Superadmins can view all leads"
  ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage all payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Widget analytics policies
CREATE POLICY "Users can view own analytics"
  ON public.widget_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.widget_configs wc
      WHERE wc.id = widget_analytics.widget_id AND wc.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON public.widget_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Superadmins can view all analytics"
  ON public.widget_analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.widget_configs (user_id, whatsapp_destination)
  VALUES (NEW.id, '');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON public.widget_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;