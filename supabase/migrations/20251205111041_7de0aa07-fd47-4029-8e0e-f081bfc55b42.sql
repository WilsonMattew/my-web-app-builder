-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'developer', 'creative', 'marketing');
CREATE TYPE public.availability_status AS ENUM ('available', 'busy', 'away', 'offline');
CREATE TYPE public.client_status AS ENUM ('lead', 'prospect', 'active', 'churned');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'review', 'completed', 'on_hold');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'blocked', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.ai_assistant_type AS ENUM ('oracle', 'aether', 'muse', 'ascend');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  external_persona TEXT,
  avatar_url TEXT,
  availability_status availability_status DEFAULT 'available',
  current_bandwidth INTEGER DEFAULT 0 CHECK (current_bandwidth >= 0 AND current_bandwidth <= 100),
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  status client_status DEFAULT 'lead',
  total_value DECIMAL(12, 2) DEFAULT 0,
  avatar_url TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  status project_status DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  deadline TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table (for AI assistants)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_type ai_assistant_type NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
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

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Clients policies (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Projects policies
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tasks policies
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE TO authenticated USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Conversations policies (users can only access their own)
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Messages policies (through conversation ownership)
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can create messages in own conversations" ON public.messages FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- Activity logs policies
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all activity" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is 'developer' for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'developer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;