-- ====================================================================
-- LeadCraft AI - Schema Inicial & Row Level Security (RLS)
-- ====================================================================

-- 1. Tabela: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 2. Tabela: businesses (Estabelecimentos mapeados e salvos pelo usuário)
CREATE TABLE IF NOT EXISTS public.businesses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  category_key text NOT NULL,
  address text NOT NULL,
  phone text,
  whatsapp text,
  instagram text,
  website_url text,
  website_status text NOT NULL DEFAULT 'unconfirmed',
  rating numeric(3,2),
  review_count int,
  lat float8 NOT NULL,
  lng float8 NOT NULL,
  distance_km numeric(6,2),
  collected_data jsonb DEFAULT '{}'::jsonb,
  opportunity_score text NOT NULL DEFAULT 'medium',
  opportunity_reason text,
  potential_score int DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabela: leads (Pipeline de prospecção e CRM)
CREATE TABLE IF NOT EXISTS public.leads (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id text NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  project_id text,
  status text NOT NULL DEFAULT 'new',
  notes text DEFAULT '',
  is_favorite boolean DEFAULT false,
  first_contact_at timestamptz,
  last_contact_at timestamptz,
  interaction_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Tabela: landing_pages (Sites gerados com IA)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id text,
  project_name text NOT NULL,
  category text,
  style_id text NOT NULL,
  style_config jsonb NOT NULL,
  content jsonb NOT NULL,
  html_content text,
  demo_url text,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Tabela: generated_messages (Histórico de abordagens comerciais)
CREATE TABLE IF NOT EXISTS public.generated_messages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id text,
  landing_page_id text REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  message_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Tabela: search_history (Histórico de pesquisas individuais)
CREATE TABLE IF NOT EXISTS public.search_history (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query text NOT NULL,
  radius_km int NOT NULL,
  categories text[] DEFAULT '{}',
  filters_applied jsonb DEFAULT '{}'::jsonb,
  results_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. Tabela: user_settings (Configurações exclusivas do usuário)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key text DEFAULT '',
  google_places_api_key text DEFAULT '',
  map_provider text DEFAULT 'osm',
  user_city text DEFAULT 'São Paulo, SP',
  default_radius_km int DEFAULT 5,
  visual_preferences jsonb DEFAULT '{"theme":"dark"}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ====================================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.landing_pages TO anon;

-- Profiles Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own') THEN
    CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- Businesses Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'businesses_select_own') THEN
    CREATE POLICY businesses_select_own ON public.businesses FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'businesses_insert_own') THEN
    CREATE POLICY businesses_insert_own ON public.businesses FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'businesses_update_own') THEN
    CREATE POLICY businesses_update_own ON public.businesses FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'businesses_delete_own') THEN
    CREATE POLICY businesses_delete_own ON public.businesses FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Leads Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_select_own') THEN
    CREATE POLICY leads_select_own ON public.leads FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_insert_own') THEN
    CREATE POLICY leads_insert_own ON public.leads FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_update_own') THEN
    CREATE POLICY leads_update_own ON public.leads FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leads_delete_own') THEN
    CREATE POLICY leads_delete_own ON public.leads FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Landing Pages Policies (Próprias para usuários autenticados, e públicas para preview por clientes)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'landing_pages_select_own') THEN
    CREATE POLICY landing_pages_select_own ON public.landing_pages FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'landing_pages_select_public') THEN
    CREATE POLICY landing_pages_select_public ON public.landing_pages FOR SELECT TO anon USING (status IN ('ready', 'shared'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'landing_pages_insert_own') THEN
    CREATE POLICY landing_pages_insert_own ON public.landing_pages FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'landing_pages_update_own') THEN
    CREATE POLICY landing_pages_update_own ON public.landing_pages FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'landing_pages_delete_own') THEN
    CREATE POLICY landing_pages_delete_own ON public.landing_pages FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Generated Messages Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_messages_select_own') THEN
    CREATE POLICY generated_messages_select_own ON public.generated_messages FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_messages_insert_own') THEN
    CREATE POLICY generated_messages_insert_own ON public.generated_messages FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_messages_update_own') THEN
    CREATE POLICY generated_messages_update_own ON public.generated_messages FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_messages_delete_own') THEN
    CREATE POLICY generated_messages_delete_own ON public.generated_messages FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Search History Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_history_select_own') THEN
    CREATE POLICY search_history_select_own ON public.search_history FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_history_insert_own') THEN
    CREATE POLICY search_history_insert_own ON public.search_history FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'search_history_delete_own') THEN
    CREATE POLICY search_history_delete_own ON public.search_history FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- User Settings Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_settings_select_own') THEN
    CREATE POLICY user_settings_select_own ON public.user_settings FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_settings_insert_own') THEN
    CREATE POLICY user_settings_insert_own ON public.user_settings FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_settings_update_own') THEN
    CREATE POLICY user_settings_update_own ON public.user_settings FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Storage Bucket para Assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform_assets', 'platform_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_assets_public_select') THEN
    CREATE POLICY platform_assets_public_select ON storage.objects FOR SELECT TO public USING (bucket_id = 'platform_assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_assets_auth_insert') THEN
    CREATE POLICY platform_assets_auth_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
      bucket_id = 'platform_assets' AND ((select auth.uid())::text = (storage.foldername(name))[1])
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_assets_auth_update') THEN
    CREATE POLICY platform_assets_auth_update ON storage.objects FOR UPDATE TO authenticated USING (
      bucket_id = 'platform_assets' AND ((select auth.uid())::text = (storage.foldername(name))[1])
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'platform_assets_auth_delete') THEN
    CREATE POLICY platform_assets_auth_delete ON storage.objects FOR DELETE TO authenticated USING (
      bucket_id = 'platform_assets' AND ((select auth.uid())::text = (storage.foldername(name))[1])
    );
  END IF;
END $$;
