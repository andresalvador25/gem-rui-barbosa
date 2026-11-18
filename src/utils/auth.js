export const ROLES = {
  ADMIN: 'admin',
  ENCARREGADO: 'encarregado',
  INSTRUTOR: 'instrutor',
  CANDIDATO: 'candidato'
};

export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    verCorpoMusical: true,
    editarCorpoMusical: true,
    verMoo: true,
    editarMoo: true,
    verGem: true,
    editarGem: true,
    excluirGem: true,
    verChamada: true,
    editarChamada: true,
    verPortalCandidato: true,
    gerenciarAcessos: true,
    gerenciarConfig: true
  },
  [ROLES.ENCARREGADO]: {
    verCorpoMusical: true,
    editarCorpoMusical: true,
    verMoo: true,
    editarMoo: true,
    verGem: true,
    editarGem: true,
    excluirGem: true,
    verChamada: true,
    editarChamada: true,
    verPortalCandidato: false,
    gerenciarAcessos: false,
    gerenciarConfig: false
  },
  [ROLES.INSTRUTOR]: {
    verCorpoMusical: true,
    editarCorpoMusical: false,
    verMoo: true,
    editarMoo: false,
    verGem: true,
    editarGem: true,
    excluirGem: false,
    verChamada: true,
    editarChamada: true,
    verPortalCandidato: false,
    gerenciarAcessos: false,
    gerenciarConfig: false
  },
  [ROLES.CANDIDATO]: {
    verCorpoMusical: false,
    editarCorpoMusical: false,
    verMoo: false,
    editarMoo: false,
    verGem: false,
    editarGem: false,
    excluirGem: false,
    verChamada: false,
    editarChamada: false,
    verPortalCandidato: true,
    gerenciarAcessos: false,
    gerenciarConfig: false
  }
};

export const PERMISSION_LABELS = [
  {
    key: 'verCorpoMusical',
    group: 'Corpo Musical & Orquestra',
    label: 'Visualizar Corpo Musical (Lista, União GEM e Relação)',
    desc: 'Permite ver a lista de músicos/organistas e relatórios da orquestra.'
  },
  {
    key: 'editarCorpoMusical',
    group: 'Corpo Musical & Orquestra',
    label: 'Cadastrar / Editar / Promover Integrantes na Orquestra',
    desc: 'Permite adicionar, editar ou remover integrantes do Corpo Musical.'
  },
  {
    key: 'verMoo',
    group: 'Corpo Musical & Orquestra',
    label: 'Visualizar Gráficos MOO, Naipes & Vozes',
    desc: 'Permite acessar os diagnósticos e proporções do Manual de Orientação Orquestral.'
  },
  {
    key: 'editarMoo',
    group: 'Corpo Musical & Orquestra',
    label: 'Editar Metas MOO',
    desc: 'Permite ajustar metas da orquestra nos quadros MOO.'
  },
  {
    key: 'verGem',
    group: 'GEM & Estudos Musicais',
    label: 'Visualizar GEM Completo (Fichas, Organistas e Aula Musical)',
    desc: 'Permite consultar todos os alunos, organistas e relação de aulas do GEM.'
  },
  {
    key: 'editarGem',
    group: 'GEM & Estudos Musicais',
    label: 'Cadastrar Alunos e Lançar Aulas / Provas no GEM',
    desc: 'Permite criar/editar fichas do GEM e registrar lições, hinos e avaliações.'
  },
  {
    key: 'excluirGem',
    group: 'GEM & Estudos Musicais',
    label: 'Excluir Alunos / Registros do GEM',
    desc: 'Permite remover fichas ou lançamentos do GEM.'
  },
  {
    key: 'verChamada',
    group: 'GEM & Estudos Musicais',
    label: 'Visualizar Presença & Chamada (2026 / 2027)',
    desc: 'Permite consultar o quadro geral de presenças e calendário de aulas.'
  },
  {
    key: 'editarChamada',
    group: 'GEM & Estudos Musicais',
    label: 'Lançar Presenças (C/X) e Datas na Chamada',
    desc: 'Permite marcar presença/falta e configurar datas/feriados na chamada.'
  },
  {
    key: 'verPortalCandidato',
    group: 'Portal do Candidato / Responsável',
    label: 'Acessar Portal Individual do(s) Candidato(s) Vinculado(s)',
    desc: 'Permite ao candidato ou pai/responsável acompanhar a ficha, aulas e faltas dos alunos vinculados.'
  },
  {
    key: 'gerenciarAcessos',
    group: 'Administração do Sistema',
    label: 'Aprovar Cadastros e Gerenciar Acessos (ADM)',
    desc: 'Permite liberar novos usuários, alterar senhas e definir permissões.'
  },
  {
    key: 'gerenciarConfig',
    group: 'Administração do Sistema',
    label: 'Ajustes Gerais e Backup do Sistema',
    desc: 'Permite alterar configurações da localidade e restaurar backups.'
  }
];

export const ROLE_META = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    label: 'Administrador (ADM)',
    shortLabel: 'ADM',
    badgeClass: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
    pillClass: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Controle total do sistema, liberação de cadastros, permissões de usuários, Orquestra e GEM.'
  },
  [ROLES.ENCARREGADO]: {
    id: ROLES.ENCARREGADO,
    label: 'Encarregado (Local / Regional)',
    shortLabel: 'Encarregado',
    badgeClass: 'bg-indigo-400/20 text-indigo-200 border-indigo-400/40',
    pillClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'Gestão completa da Orquestra, Balanço MOO, GEM, Promoções e Chamada (personalizável pelo ADM).'
  },
  [ROLES.INSTRUTOR]: {
    id: ROLES.INSTRUTOR,
    label: 'Instrutor(a) / Examinadora',
    shortLabel: 'Instrutor(a)',
    badgeClass: 'bg-sky-400/20 text-sky-200 border-sky-400/40',
    pillClass: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Atuação no GEM: lançar aulas/provas, chamada 2026/2027, editar fichas e consultar Orquestra/MOO.'
  },
  [ROLES.CANDIDATO]: {
    id: ROLES.CANDIDATO,
    label: 'Candidato(a) / Responsável (Pai/Mãe)',
    shortLabel: 'Candidato / Resp.',
    badgeClass: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40',
    pillClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Acompanhamento individual de 1 ou mais candidatos vinculados (ficha, histórico de lições e frequência).'
  }
};

export function getRoleMeta(role) {
  return ROLE_META[role] || ROLE_META[ROLES.CANDIDATO];
}

export function getDefaultPermissionsForRole(role) {
  return { ...(DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS[ROLES.CANDIDATO]) };
}

export function getUserAlunoIds(user) {
  if (!user) return [];
  const list = [];
  if (Array.isArray(user.alunoIds)) {
    user.alunoIds.forEach(id => {
      if (id !== null && id !== undefined && id !== '') {
        const num = Number(id) || id;
        if (!list.includes(num)) list.push(num);
      }
    });
  }
  if (user.alunoId !== null && user.alunoId !== undefined && user.alunoId !== '') {
    const num = Number(user.alunoId) || user.alunoId;
    if (!list.includes(num)) list.push(num);
  }
  return list;
}

export function getPermissoes(user) {
  const role = user?.role || ROLES.CANDIDATO;
  const isAdmin = role === ROLES.ADMIN;
  const isEncarregado = role === ROLES.ENCARREGADO;
  const isInstrutor = role === ROLES.INSTRUTOR;
  const isCandidatoRole = role === ROLES.CANDIDATO;

  const base = getDefaultPermissionsForRole(role);
  const custom = user?.permissoes && typeof user.permissoes === 'object' ? user.permissoes : {};
  const merged = { ...base, ...custom };

  if (isAdmin) {
    merged.gerenciarAcessos = true;
    merged.gerenciarConfig = true;
  }

  const canViewCorpoMusical = Boolean(merged.verCorpoMusical || merged.editarCorpoMusical || merged.verMoo);
  const canEditCorpoMusical = Boolean(merged.editarCorpoMusical);
  const canViewMoo = Boolean(merged.verMoo || merged.editarMoo);
  const canEditMoo = Boolean(merged.editarMoo);
  const canViewGemFull = Boolean(merged.verGem || merged.editarGem || merged.verChamada || merged.editarChamada);
  const canEditGem = Boolean(merged.editarGem);
  const canDeleteGem = Boolean(merged.excluirGem);
  const canViewChamada = Boolean(merged.verChamada || merged.editarChamada);
  const canEditChamada = Boolean(merged.editarChamada);
  const canViewPortalCandidato = Boolean(merged.verPortalCandidato || isCandidatoRole);

  // Se o usuário não tem acesso nem ao Corpo Musical Geral nem ao GEM Geral, exibe diretamente o Portal do Candidato/Responsável
  const onlyPortalCandidato = !canViewCorpoMusical && !canViewGemFull;

  return {
    role,
    isAdmin,
    isEncarregado,
    isInstrutor,
    isCandidato: onlyPortalCandidato,
    isCandidatoRole,
    raw: merged,
    canViewCorpoMusical,
    canEditCorpoMusical,
    canPromoteAluno: canEditCorpoMusical,
    canViewMoo,
    canEditMoo,
    canViewGemFull,
    canViewGemFichas: Boolean(merged.verGem || merged.editarGem),
    canEditGem,
    canDeleteGem,
    canViewChamada,
    canEditChamada,
    canEditAulaMusical: canEditGem,
    canViewPortalCandidato,
    canManageUsers: Boolean(merged.gerenciarAcessos || isAdmin),
    canManageConfig: Boolean(merged.gerenciarConfig || isAdmin)
  };
}

const TOKEN_KEY = 'sam_auth_token';
const USER_KEY = 'sam_auth_user';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(user, token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

let interceptorInstalled = false;

export function installApiAuthInterceptor() {
  if (interceptorInstalled || typeof window === 'undefined') return;
  interceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.startsWith('/api/')) {
      const token = getAuthToken();
      if (token) {
        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return originalFetch(input, { ...init, headers });
      }
    }
    return originalFetch(input, init);
  };
}
