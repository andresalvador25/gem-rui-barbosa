-- ==============================================================================
-- SCHEMA SUPABASE: SISTEMA GEM (GRUPO DE ESTUDOS MUSICAIS) - CCB VILA RUI BARBOSA
-- ==============================================================================
-- Este arquivo contém o script DDL SQL completo para criar as tabelas no Supabase.
-- Inclui chaves primárias, chaves estrangeiras, índices e políticas RLS.

-- 1. EXTENSÃO PARA UUID (caso não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE ALUNOS DO GEM
CREATE TABLE IF NOT EXISTS public.alunos_gem (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    comum_congregacao TEXT NOT NULL DEFAULT 'VILA RUI BARBOSA',
    cargo_ministerio TEXT NOT NULL DEFAULT 'MÚSICO' CHECK (cargo_ministerio IN ('MÚSICO', 'ORGANISTA')),
    nivel TEXT NOT NULL DEFAULT 'CANDIDATO(A)' CHECK (nivel IN ('CANDIDATO(A)', 'RJM', 'MEIA HORA', 'CULTO OFICIAL', 'OFICIALIZADO')),
    possui_instrumento TEXT NOT NULL DEFAULT 'SIM' CHECK (possui_instrumento IN ('SIM', 'NÃO')),
    instrumento_proprio TEXT NOT NULL DEFAULT 'SIM' CHECK (instrumento_proprio IN ('SIM', 'NÃO')),
    instrumento TEXT NOT NULL,
    tonalidade TEXT NOT NULL DEFAULT 'DÓ' CHECK (tonalidade IN ('DÓ', 'SIb', 'MIb', 'FÁ')),
    data_inicio_gem DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_alunos_gem_nome ON public.alunos_gem(nome);
CREATE INDEX IF NOT EXISTS idx_alunos_gem_instrumento ON public.alunos_gem(instrumento);
CREATE INDEX IF NOT EXISTS idx_alunos_gem_nivel ON public.alunos_gem(nivel);

-- 3. TABELA DE HISTÓRICO DE AULAS / ATIVIDADES / AVALIAÇÕES DO GEM
CREATE TABLE IF NOT EXISTS public.historico_gem (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID NOT NULL REFERENCES public.alunos_gem(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('MTS', 'MSA', 'Prova', 'Método', 'Hinário', 'Escalas')),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Campos para MSA / MTS / Prova
    fase_de TEXT,
    fase_ate TEXT,
    pagina_de TEXT,
    pagina_ate TEXT,
    licao_de TEXT,
    licao_ate TEXT,
    claves JSONB DEFAULT '[]'::jsonb, -- Ex: ["Sol", "Dó"]
    
    -- Campos específicos de Prova
    metodo_avaliacao TEXT, -- 'MSA' ou 'MTS'
    nota NUMERIC(4, 2), -- Ex: 7.50, 10.00
    
    -- Campos específicos de Método
    nome_metodo TEXT, -- Ex: 'Bona', 'Schmoll', 'Laoureux'
    
    -- Campos específicos de Hinário
    numero_hino TEXT,
    voz_hino TEXT CHECK (voz_hino IN ('Soprano', 'Contralto', 'Tenor', 'Baixo', NULL)),
    
    -- Campos específicos de Escalas
    tonalidade_escala TEXT,
    
    -- Campos gerais
    observacoes TEXT,
    autorizado_por TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para histórico
CREATE INDEX IF NOT EXISTS idx_historico_gem_aluno_id ON public.historico_gem(aluno_id);
CREATE INDEX IF NOT EXISTS idx_historico_gem_tipo ON public.historico_gem(tipo);
CREATE INDEX IF NOT EXISTS idx_historico_gem_data ON public.historico_gem(data DESC);

-- 4. TRIGGER PARA ATUALIZAR 'updated_at' AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_alunos_gem ON public.alunos_gem;
CREATE TRIGGER set_updated_at_alunos_gem
    BEFORE UPDATE ON public.alunos_gem
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. TABELA DE PERFIS E ACESSO (ENCARREGADO/ADM, INSTRUTOR, CANDIDATO)
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'candidato' CHECK (role IN ('admin', 'instrutor', 'candidato')),
    aluno_id UUID REFERENCES public.alunos_gem(id) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_perfis_role ON public.perfis(role);
CREATE INDEX IF NOT EXISTS idx_perfis_aluno_id ON public.perfis(aluno_id);

DROP TRIGGER IF EXISTS set_updated_at_perfis ON public.perfis;
CREATE TRIGGER set_updated_at_perfis
    BEFORE UPDATE ON public.perfis
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. TABELAS COMPLEMENTARES PARA MIGRAÇÃO COMPLETA ANTES DO DEPLOY
CREATE TABLE IF NOT EXISTS public.integrantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Músico' CHECK (categoria IN ('Músico', 'Organista')),
    instrumento TEXT NOT NULL,
    naipe TEXT NOT NULL,
    ensaios BOOLEAN NOT NULL DEFAULT TRUE,
    rjm BOOLEAN NOT NULL DEFAULT FALSE,
    meia_hora BOOLEAN NOT NULL DEFAULT FALSE,
    cultos_oficiais BOOLEAN NOT NULL DEFAULT FALSE,
    oficializado BOOLEAN NOT NULL DEFAULT FALSE,
    batizado BOOLEAN NOT NULL DEFAULT TRUE,
    telefone TEXT,
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.presenca_gem_2026 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES public.alunos_gem(id) ON DELETE CASCADE,
    nome_aluno TEXT NOT NULL,
    instrumento TEXT,
    msa TEXT,
    comum TEXT DEFAULT 'Vila Rui Barbosa',
    presencas JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.organistas_gem (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    comum TEXT DEFAULT 'Vila Rui Barbosa | Jundiaí',
    ministerio TEXT DEFAULT 'Organista',
    instrumento TEXT DEFAULT 'Órgão Eletrônico',
    nivel TEXT NOT NULL DEFAULT 'Candidata',
    contato TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.moo_config (
    id TEXT PRIMARY KEY DEFAULT 'padrao',
    localidade TEXT NOT NULL DEFAULT 'Vila Rui Barbosa',
    cidade TEXT NOT NULL DEFAULT 'Jundiaí - SP',
    tipo_orquestra TEXT NOT NULL DEFAULT 'Simples',
    quantidade_desejada INTEGER NOT NULL DEFAULT 32,
    metas_ofic JSONB DEFAULT '{}'::jsonb,
    metas_gem JSONB DEFAULT '{}'::jsonb,
    relacao_aula_musical JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. FUNÇÕES AUXILIARES DE PERFIL PARA ROW LEVEL SECURITY (RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid() AND ativo = TRUE LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_aluno_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT aluno_id FROM public.perfis WHERE id = auth.uid() AND ativo = TRUE LIMIT 1;
$$;

-- 8. HABILITAR ROW LEVEL SECURITY (RLS) POR PERFIL
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos_gem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_gem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presenca_gem_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organistas_gem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moo_config ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas abertas caso existam
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.alunos_gem;
DROP POLICY IF EXISTS "Permitir inserção e atualização" ON public.alunos_gem;
DROP POLICY IF EXISTS "Permitir leitura do histórico" ON public.historico_gem;
DROP POLICY IF EXISTS "Permitir inserção e atualização do histórico" ON public.historico_gem;

-- PERFIS: usuário vê seu próprio perfil; Admin gerencia todos
CREATE POLICY "perfis_select_own_or_admin" ON public.perfis
  FOR SELECT USING (id = auth.uid() OR public.get_my_role() = 'admin');
CREATE POLICY "perfis_admin_all" ON public.perfis
  FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- ALUNOS GEM: Admin e Instrutor leem/editam; somente Admin exclui; Candidato lê apenas a si mesmo
CREATE POLICY "alunos_gem_select_by_role" ON public.alunos_gem
  FOR SELECT USING (
    public.get_my_role() IN ('admin', 'instrutor')
    OR (public.get_my_role() = 'candidato' AND id = public.get_my_aluno_id())
  );
CREATE POLICY "alunos_gem_insert_staff" ON public.alunos_gem
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "alunos_gem_update_staff" ON public.alunos_gem
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "alunos_gem_delete_admin" ON public.alunos_gem
  FOR DELETE USING (public.get_my_role() = 'admin');

-- HISTÓRICO GEM: Admin e Instrutor lançam/editam; somente Admin exclui; Candidato lê apenas o próprio histórico
CREATE POLICY "historico_gem_select_by_role" ON public.historico_gem
  FOR SELECT USING (
    public.get_my_role() IN ('admin', 'instrutor')
    OR (public.get_my_role() = 'candidato' AND aluno_id = public.get_my_aluno_id())
  );
CREATE POLICY "historico_gem_insert_staff" ON public.historico_gem
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "historico_gem_update_staff" ON public.historico_gem
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "historico_gem_delete_admin" ON public.historico_gem
  FOR DELETE USING (public.get_my_role() = 'admin');

-- INTEGRANTES & MOO: Admin gerencia tudo; Instrutor apenas visualiza; Candidato sem acesso
CREATE POLICY "integrantes_select_staff" ON public.integrantes
  FOR SELECT USING (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "integrantes_admin_write" ON public.integrantes
  FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "moo_config_select_staff" ON public.moo_config
  FOR SELECT USING (public.get_my_role() IN ('admin', 'instrutor'));
CREATE POLICY "moo_config_admin_write" ON public.moo_config
  FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- PRESENÇA 2026: Admin e Instrutor fazem chamada; Candidato lê apenas a própria frequência
CREATE POLICY "presenca_select_by_role" ON public.presenca_gem_2026
  FOR SELECT USING (
    public.get_my_role() IN ('admin', 'instrutor')
    OR (public.get_my_role() = 'candidato' AND aluno_id = public.get_my_aluno_id())
  );
CREATE POLICY "presenca_write_staff" ON public.presenca_gem_2026
  FOR ALL USING (public.get_my_role() IN ('admin', 'instrutor')) WITH CHECK (public.get_my_role() IN ('admin', 'instrutor'));

-- ORGANISTAS GEM: Admin e Instrutor acessam
CREATE POLICY "organistas_gem_staff" ON public.organistas_gem
  FOR ALL USING (public.get_my_role() IN ('admin', 'instrutor')) WITH CHECK (public.get_my_role() IN ('admin', 'instrutor'));
