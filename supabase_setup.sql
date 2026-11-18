-- ============================================================================
-- SAM MUSICAL CCB — SCRIPT DE CRIAÇÃO DO BANCO NO SUPABASE (PLANO GRATUITO)
-- Cole este código no menu "SQL Editor" do seu novo projeto no Supabase e clique em "Run"
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sam_ccb_storage (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Libera acesso para a API do backend (via SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY)
ALTER TABLE public.sam_ccb_storage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso API SAM Musical" ON public.sam_ccb_storage;
CREATE POLICY "Acesso API SAM Musical"
  ON public.sam_ccb_storage
  FOR ALL
  USING (true)
  WITH CHECK (true);
