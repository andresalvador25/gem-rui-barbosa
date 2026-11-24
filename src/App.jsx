import React, { useState, useEffect } from 'react';
import {
  Music,
  Printer,
  RefreshCw,
  Settings,
  UserPlus,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  BookOpen,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  Piano,
  GraduationCap
} from 'lucide-react';
import NaipeCards from './components/NaipeCards.jsx';
import UnifiedTable from './components/UnifiedTable.jsx';
import IntegranteModal from './components/IntegranteModal.jsx';
import ConfigModal from './components/ConfigModal.jsx';
import MooView from './components/MooView.jsx';
import RelacaoTable from './components/RelacaoTable.jsx';
import RelacaoAulaMusicalView from './components/RelacaoAulaMusicalView.jsx';
import Presenca2026View from './components/Presenca2026View.jsx';
import OrganistasGemView from './components/OrganistasGemView.jsx';
import FichaAlunoGemView from './components/FichaAlunoGemView.jsx';
import UniaoOrquestraGemView from './components/UniaoOrquestraGemView.jsx';
import AlunoGemModal from './components/AlunoGemModal.jsx';
import LancamentoHistoricoModal from './components/LancamentoHistoricoModal.jsx';
import LoginView from './components/LoginView.jsx';
import PerfisModal from './components/PerfisModal.jsx';
import PortalCandidatoView from './components/PortalCandidatoView.jsx';
import { isSamePerson } from './utils/gemSync.js';
import {
  getStoredUser,
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  installApiAuthInterceptor,
  getPermissoes,
  getRoleMeta
} from './utils/auth.js';

installApiAuthInterceptor();

export default function App() {
  const [data, setData] = useState({
    config: {
      localidade: 'Vila Rui Barbosa',
      cidade: 'Jundiaí - SP',
      tipoOrquestra: 'Simples',
      quantidadeDesejada: 32
    },
    integrantes: [],
    mooRecomendacoes: null
  });

  // Autenticação e Perfis
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authChecked, setAuthChecked] = useState(false);
  const [isPerfisModalOpen, setIsPerfisModalOpen] = useState(false);
  const [pendentesCount, setPendentesCount] = useState(0);

  // Menu Lateral no Celular (Drawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 2 Abas Principais e Sub-abas
  const [mainTab, setMainTab] = useState('corpo');
  const [subTabCorpo, setSubTabCorpo] = useState('integrantes'); // 'integrantes', 'uniao', 'relacao', 'moo_graficos'
  const [subTabGem, setSubTabGem] = useState('fichas'); // 'fichas', 'presenca', 'organistas', 'aulas'

  const [loading, setLoading] = useState(false);
  const [activeNaipeFilter, setActiveNaipeFilter] = useState('Todos');
  const [filtroRelacao, setFiltroRelacao] = useState(null);
  const [isIntegranteModalOpen, setIsIntegranteModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Estados integrados do GEM
  const [alunosGem, setAlunosGem] = useState([]);
  const [modalAlunoGem, setModalAlunoGem] = useState(null);
  const [modalLancamentoGem, setModalLancamentoGem] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Carregar dados da API
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/all');
      if (res.ok) {
        const json = await res.json();
        let integrs = json.integrantes || [];
        if ((!integrs || integrs.length === 0) && (json.musicos || json.organistas)) {
          integrs = [];
          if (Array.isArray(json.musicos)) {
            json.musicos.forEach(m =>
              integrs.push({
                id: m.id || Date.now() + Math.random(),
                nome: m.nome,
                categoria: 'Músico',
                instrumento: m.instrumento || 'Violino',
                naipe: m.naipe || 'Cordas',
                situacao: m.oficializado || m.fase === 'Oficializado' ? 'Oficializado' : 'Aluno GEM / Estudos',
                telefone: m.telefone || '',
                observacao: m.observacao || ''
              })
            );
          }
          if (Array.isArray(json.organistas)) {
            json.organistas.forEach(o =>
              integrs.push({
                id: o.id || Date.now() + Math.random(),
                nome: o.nome,
                categoria: 'Organista',
                instrumento: 'Órgão Eletrônico',
                naipe: 'Teclas / Organistas',
                situacao: o.oficializada || o.status === 'Oficializada' ? 'Oficializado' : 'Aluno GEM / Estudos',
                telefone: o.telefone || '',
                observacao: o.observacao || ''
              })
            );
          }
        }
        setData({
          config: json.config || {
            localidade: 'Vila Rui Barbosa',
            cidade: 'Jundiaí - SP',
            tipoOrquestra: 'Simples',
            quantidadeDesejada: 32
          },
          integrantes: integrs,
          mooRecomendacoes: json.mooRecomendacoes || null
        });
      }

      try {
        const resGem = await fetch('/api/gem/alunos');
        if (resGem.ok) {
          const jsonGem = await resGem.json();
          if (jsonGem.alunos) {
            setAlunosGem(jsonGem.alunos);
          }
        }
      } catch (eGem) {
        console.warn('Backend GEM offline, usando dados locais', eGem);
      }
    } catch (e) {
      console.warn('Backend local conectando... modo offline/local ativo.', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetch('/api/auth/me')
        .then(res => (res.ok ? res.json() : null))
        .then(json => {
          if (json?.success && json.user) {
            setCurrentUser(json.user);
            setAuthSession(json.user, token);
          } else {
            clearAuthSession();
            setCurrentUser(null);
          }
        })
        .catch(() => {})
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('gem-data-updated', handleSync);
    return () => window.removeEventListener('gem-data-updated', handleSync);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setAuthSession(user, token);
    setCurrentUser(user);
    setMainTab(user.role === 'instrutor' ? 'gem' : 'corpo');
    loadData();
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  const permissoes = getPermissoes(currentUser);
  const roleMeta = getRoleMeta(currentUser?.role);

  useEffect(() => {
    if (permissoes.canManageUsers) {
      fetch('/api/auth/users')
        .then(res => (res.ok ? res.json() : null))
        .then(json => {
          if (json?.users) {
            const pend = json.users.filter(u => u.status === 'pendente' || u.ativo === false).length;
            setPendentesCount(pend);
          }
        })
        .catch(() => {});
    } else {
      setPendentesCount(0);
    }
  }, [currentUser, permissoes.canManageUsers]);

  useEffect(() => {
    if (!permissoes.canViewCorpoMusical && permissoes.canViewGemFull && mainTab === 'corpo') {
      setMainTab('gem');
    } else if (!permissoes.canViewGemFull && permissoes.canViewCorpoMusical && mainTab === 'gem') {
      setMainTab('corpo');
    }
  }, [permissoes.canViewCorpoMusical, permissoes.canViewGemFull, mainTab]);

  // Navegar para aba/sub-aba e fechar drawer mobile
  const navigateTo = (tab, sub) => {
    setMainTab(tab);
    if (tab === 'corpo' && sub) setSubTabCorpo(sub);
    if (tab === 'gem' && sub) setSubTabGem(sub);
    setMobileMenuOpen(false);
  };

  // Salvar ou atualizar integrante
  const handleSaveIntegrante = async (item) => {
    try {
      const res = await fetch('/api/integrantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        showToast(item.id ? 'Cadastro atualizado e sincronizado com sucesso!' : 'Novo integrante cadastrado com sucesso!');
        await loadData();
        window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: item }));
      } else {
        setData(prev => {
          const list = [...(prev.integrantes || [])];
          if (!item.id) {
            item.id = Date.now();
            list.push(item);
          } else {
            const idx = list.findIndex(i => i.id === item.id);
            if (idx !== -1) list[idx] = item;
            else list.push(item);
          }
          return { ...prev, integrantes: list };
        });
        showToast('Salvo com sucesso!');
      }
    } catch {
      setData(prev => {
        const list = [...(prev.integrantes || [])];
        if (!item.id) {
          item.id = Date.now();
          list.push(item);
        } else {
          const idx = list.findIndex(i => i.id === item.id);
          if (idx !== -1) list[idx] = item;
          else list.push(item);
        }
        return { ...prev, integrantes: list };
      });
      showToast('Salvo localmente!');
    }
  };

  // Excluir integrante
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await fetch(`/api/integrantes/${deleteCandidate.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`"${deleteCandidate.nome}" foi removido com sucesso.`);
        loadData();
      } else {
        setData(prev => ({
          ...prev,
          integrantes: prev.integrantes.filter(i => i.id !== deleteCandidate.id)
        }));
        showToast('Removido localmente.');
      }
    } catch {
      setData(prev => ({
        ...prev,
        integrantes: prev.integrantes.filter(i => i.id !== deleteCandidate.id)
      }));
      showToast('Removido localmente.');
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Salvar configurações
  const handleSaveConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        showToast('Configurações salvas!');
        loadData();
      } else {
        setData(prev => ({ ...prev, config: { ...prev.config, ...newConfig } }));
      }
    } catch {
      setData(prev => ({ ...prev, config: { ...prev.config, ...newConfig } }));
    }
  };

  // Zerar banco de dados
  const handleResetEmpty = async () => {
    try {
      const res = await fetch('/api/reset-empty', { method: 'POST' });
      if (res.ok) {
        showToast('Banco de dados zerado com sucesso!', 'info');
        loadData();
      }
    } catch {
      setData(prev => ({ ...prev, integrantes: [] }));
      showToast('Banco de dados zerado localmente!', 'info');
    }
  };

  // Restaurar dados do backup
  const handleRestoreBackup = async () => {
    try {
      const res = await fetch('/api/restore-backup', { method: 'POST' });
      if (res.ok) {
        showToast('Dados restaurados com sucesso!');
        loadData();
      } else {
        alert('Não foi possível restaurar os dados do backup.');
      }
    } catch {
      alert('Erro ao conectar ao servidor para restaurar backup.');
    }
  };

  // Indicadores gerais
  const total = data.integrantes.length;
  const gemApenasCount = alunosGem.filter(a => !data.integrantes.some(i => isSamePerson(i, a))).length;
  const totalUnificadoCount = total + gemApenasCount;
  const musicosCount = data.integrantes.filter(i => i.categoria === 'Músico').length;
  const organistasCount = data.integrantes.filter(i => i.categoria === 'Organista').length;
  const oficializadosCount = data.integrantes.filter(i => i.oficializado === true).length;
  const alunosCount = data.integrantes.filter(i => !i.oficializado).length;

  if (!currentUser && authChecked) {
    return (
      <LoginView
        localidade={data.config?.localidade}
        cidade={data.config?.cidade}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Título amigável da tela atual para a barra mobile
  const getActiveViewTitle = () => {
    if (permissoes.isCandidato) return 'Portal do Candidato';
    if (mainTab === 'corpo') {
      if (subTabCorpo === 'integrantes') return 'Lista de Integrantes';
      if (subTabCorpo === 'uniao') return 'Painel Geral & União GEM';
      if (subTabCorpo === 'relacao') return 'Relação Analítica';
      return 'Gráficos MOO & Vozes';
    }
    if (subTabGem === 'fichas') return 'Fichas & Histórico GEM';
    if (subTabGem === 'presenca') return 'Presença & Chamada';
    if (subTabGem === 'organistas') return 'Organistas GEM';
    return 'Relação Aula Musical';
  };

  // Conteúdo reutilizável do Menu Lateral (usado na Sidebar Desktop e no Drawer Mobile)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white select-none">
      {/* Topo da Sidebar: Marca & Localidade */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-inner shrink-0">
            <Music className="w-5 h-5 text-blue-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white truncate">
                SAM MUSICAL
              </span>
              <span className="bg-blue-800 text-blue-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-700 shrink-0">
                CCB
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 font-medium truncate flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              {data.config?.localidade || 'Vila Rui Barbosa'}
            </p>
          </div>
        </div>

        {/* Botão fechar no mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Botão de Cadastro Rápido */}
      {permissoes.canEditCorpoMusical && !permissoes.isCandidato && (
        <div className="px-3.5 pt-3.5">
          <button
            onClick={() => {
              setItemToEdit(null);
              setIsIntegranteModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Integrante / Aluno</span>
          </button>
        </div>
      )}

      {/* Navegação Lateral: Abas Principais e Sub-abas */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {!permissoes.isCandidato && permissoes.canViewCorpoMusical && (
          <div className="space-y-1.5">
            <button
              onClick={() => navigateTo('corpo', subTabCorpo)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                mainTab === 'corpo'
                  ? 'bg-blue-600/25 text-blue-200 border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>1. Corpo Musical</span>
              </span>
              <span className="bg-blue-900/80 text-blue-200 text-[10px] px-2 py-0.5 rounded-full border border-blue-700/60">
                {totalUnificadoCount}
              </span>
            </button>

            {/* Sub-abas do Corpo Musical */}
            <div className="pl-3 space-y-1 border-l-2 border-blue-800/60 ml-3">
              {[
                { id: 'integrantes', label: 'Lista de Integrantes', emoji: '📋' },
                { id: 'uniao', label: 'Painel Geral & União GEM', emoji: '🏛️' },
                { id: 'relacao', label: 'Relação Analítica', emoji: '📑' },
                { id: 'moo_graficos', label: 'Gráficos MOO & Vozes', emoji: '📊' }
              ].map(item => {
                const active = mainTab === 'corpo' && subTabCorpo === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo('corpo', item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {active && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!permissoes.isCandidato && permissoes.canViewGemFull && (
          <div className="space-y-1.5">
            <button
              onClick={() => navigateTo('gem', subTabGem)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                mainTab === 'gem'
                  ? 'bg-emerald-600/25 text-emerald-200 border border-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>2. GEM & Estudos</span>
              </span>
              <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-700/60">
                {alunosGem.length}
              </span>
            </button>

            {/* Sub-abas do GEM */}
            <div className="pl-3 space-y-1 border-l-2 border-emerald-800/60 ml-3">
              {[
                { id: 'fichas', label: `Fichas & Histórico (${alunosGem.length})`, emoji: '👤' },
                { id: 'presenca', label: 'Presença & Chamada', emoji: '📅' },
                { id: 'organistas', label: 'Organistas GEM', emoji: '🎹' },
                { id: 'aulas', label: 'Relação Aula Musical', emoji: '🎼' }
              ].map(item => {
                const active = mainTab === 'gem' && subTabGem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo('gem', item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {active && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Rodapé da Sidebar: Ferramentas ADM & Perfil */}
      <div className="p-3.5 border-t border-white/10 space-y-2.5 bg-slate-950/50">
        <div className="grid grid-cols-2 gap-1.5">
          {permissoes.canManageUsers && (
            <button
              onClick={() => {
                setIsPerfisModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-between bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-2 rounded-xl text-xs font-bold border border-amber-400/30 transition"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Gestão de Acessos</span>
              </span>
              {pendentesCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendentesCount} pend.
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.print();
            }}
            className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 py-2 px-2.5 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-300" />
            <span>Imprimir</span>
          </button>

          {permissoes.canManageConfig ? (
            <button
              onClick={() => {
                setIsConfigModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 py-2 px-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Settings className="w-3.5 h-3.5 text-blue-300" />
              <span>Ajustes</span>
            </button>
          ) : (
            <button
              onClick={() => {
                loadData();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 py-2 px-2.5 rounded-xl text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          )}
        </div>

        {/* Usuário Conectado + Sair */}
        {currentUser && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="min-w-0">
              <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border ${roleMeta.badgeClass}`}>
                {roleMeta.shortLabel}
              </span>
              <p className="text-xs font-bold text-white truncate mt-0.5">{currentUser.nome}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair ou trocar conta"
              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-400/30 transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-['Plus_Jakarta_Sans',sans-serif] print:bg-white print:min-h-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 lg:bottom-5 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slideUp no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* SIDEBAR FIXA NO DESKTOP (lg e maiores) */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40 shadow-xl no-print">
        {renderSidebarContent()}
      </aside>

      {/* DRAWER DESLIZANTE NO CELULAR / TABLET (< lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fadeIn">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col lg:pl-64 xl:pl-72 min-w-0 pb-20 lg:pb-0 print:pl-0 print:pb-0">
        {/* TOP BAR EXCLUSIVA PARA CELULAR / TABLET (< lg) */}
        <header className="lg:hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white sticky top-0 z-30 shadow-md no-print">
          <div className="px-3.5 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition shrink-0"
                aria-label="Abrir menu lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block leading-none">
                  SAM CCB • {mainTab === 'corpo' ? 'Corpo Musical' : 'GEM & Estudos'}
                </span>
                <h1 className="text-sm font-black text-white truncate mt-0.5">
                  {getActiveViewTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {permissoes.canManageUsers && (
                <button
                  onClick={() => setIsPerfisModalOpen(true)}
                  className="relative p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200"
                  title="Gestão de Acessos"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  {pendentesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {pendentesCount}
                    </span>
                  )}
                </button>
              )}

              {permissoes.canEditCorpoMusical && !permissoes.isCandidato && (
                <button
                  onClick={() => {
                    setItemToEdit(null);
                    setIsIntegranteModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              )}

              <button
                onClick={loadData}
                disabled={loading}
                className={`p-2 rounded-xl bg-white/10 text-white ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex-1 space-y-4 sm:space-y-5 print:p-0 print:max-w-none print:space-y-4">
          {permissoes.isCandidato ? (
            <PortalCandidatoView user={currentUser} alunosGem={alunosGem} />
          ) : (
            <>
              {/* Cabeçalho Resumo Compacto (Responsivo para Celular e Desktop) */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 no-print">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        {getActiveViewTitle()}
                      </h1>
                      <span className="text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        {data.config?.localidade || 'Vila Rui Barbosa'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {musicosCount} Músicos • {organistasCount} Organistas • {alunosGem.length} Alunos no GEM
                    </p>
                  </div>

                  {/* Botão Atualizar visível no Desktop */}
                  <button
                    onClick={loadData}
                    disabled={loading}
                    title="Sincronizar dados com o Supabase"
                    className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition ml-4"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                </div>

                {/* Cards de Resumo Rápido (Grade 3 colunas compacta no celular) */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs">
                    <Users className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
                    <div>
                      <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold leading-tight">
                        Orquestra
                      </span>
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{total}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 hidden sm:block" />
                    <div>
                      <span className="text-emerald-700 block text-[9px] sm:text-[10px] uppercase font-bold leading-tight">
                        Oficializados
                      </span>
                      <span className="font-extrabold text-emerald-900 text-xs sm:text-sm">{oficializadosCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 hidden sm:block" />
                    <div>
                      <span className="text-amber-700 block text-[9px] sm:text-[10px] uppercase font-bold leading-tight">
                        Alunos GEM
                      </span>
                      <span className="font-extrabold text-amber-900 text-xs sm:text-sm">{alunosGem.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTEÚDO DA ABA E SUB-ABA SELECIONADA NA LATERAL */}
              {mainTab === 'corpo' ? (
                <div className="space-y-5">
                  {subTabCorpo === 'integrantes' ? (
                    <div className="space-y-4 sm:space-y-6">
                      <NaipeCards
                        integrantes={data.integrantes}
                        activeNaipeFilter={activeNaipeFilter}
                        onSelectNaipe={setActiveNaipeFilter}
                      />
                      <UnifiedTable
                        integrantes={data.integrantes}
                        alunosGem={alunosGem}
                        readOnly={!permissoes.canEditCorpoMusical}
                        onOpenAlunoFicha={(aluno) => setModalAlunoGem(aluno)}
                        onOpenAlunoLancamento={(aluno) => setModalLancamentoGem(aluno)}
                        onAddClick={() => {
                          setItemToEdit(null);
                          setIsIntegranteModalOpen(true);
                        }}
                        onEditClick={(item) => {
                          setItemToEdit(item);
                          setIsIntegranteModalOpen(true);
                        }}
                        onDeleteClick={(item) => setDeleteCandidate(item)}
                        activeNaipeFilter={activeNaipeFilter}
                        onSelectNaipe={setActiveNaipeFilter}
                        initialFilter={filtroRelacao}
                      />
                    </div>
                  ) : subTabCorpo === 'uniao' ? (
                    <UniaoOrquestraGemView
                      integrantes={data.integrantes}
                      alunosGem={alunosGem}
                      canPromote={permissoes.canPromoteAluno}
                      onRefresh={loadData}
                      onOpenIntegranteModal={(item) => {
                        setItemToEdit(item);
                        setIsIntegranteModalOpen(true);
                      }}
                    />
                  ) : subTabCorpo === 'relacao' ? (
                    <div className="space-y-4 flex flex-col items-center py-2 sm:py-4 overflow-x-auto">
                      <RelacaoTable
                        integrantes={data.integrantes}
                        onSelectFilter={(filtro) => {
                          setFiltroRelacao(filtro);
                          setSubTabCorpo('integrantes');
                        }}
                      />
                    </div>
                  ) : (
                    <MooView
                      mooData={data.mooRecomendacoes}
                      integrantes={data.integrantes}
                      alunosGem={alunosGem}
                      readOnly={!permissoes.canEditMoo}
                    />
                  )}
                </div>
              ) : mainTab === 'gem' ? (
                <div className="space-y-5">
                  {subTabGem === 'fichas' ? (
                    <FichaAlunoGemView
                      canEdit={permissoes.canEditGem}
                      canDelete={permissoes.canDeleteGem}
                      onRefresh={loadData}
                    />
                  ) : subTabGem === 'presenca' ? (
                    <Presenca2026View alunosGem={alunosGem} onRefresh={loadData} />
                  ) : subTabGem === 'organistas' ? (
                    <OrganistasGemView />
                  ) : (
                    <RelacaoAulaMusicalView />
                  )}
                </div>
              ) : null}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-4 bg-white border-t border-slate-200 text-center text-xs text-slate-400 no-print">
          SAM CCB • Congregação Cristã no Brasil — {data.config?.localidade || 'Vila Rui Barbosa'} • {data.config?.cidade || 'Jundiaí - SP'}
        </footer>
      </div>

      {/* BARRA INFERIOR DE NAVEGAÇÃO RÁPIDA NO CELULAR (Estilo App Nativo) */}
      {!permissoes.isCandidato && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] grid grid-cols-5 h-16 no-print">
          <button
            onClick={() => navigateTo('corpo', 'integrantes')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
              mainTab === 'corpo' && subTabCorpo === 'integrantes'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Orquestra</span>
          </button>

          <button
            onClick={() => navigateTo('corpo', 'uniao')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
              mainTab === 'corpo' && subTabCorpo === 'uniao'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>União GEM</span>
          </button>

          <button
            onClick={() => navigateTo('gem', 'fichas')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
              mainTab === 'gem' && subTabGem === 'fichas'
                ? 'text-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Fichas GEM</span>
          </button>

          <button
            onClick={() => navigateTo('gem', 'presenca')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
              mainTab === 'gem' && subTabGem === 'presenca'
                ? 'text-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Chamada</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition ${
              mobileMenuOpen ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span>Mais Abas</span>
          </button>
        </nav>
      )}

      {/* Modal Adicionar / Editar */}
      <IntegranteModal
        isOpen={isIntegranteModalOpen}
        onClose={() => {
          setIsIntegranteModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveIntegrante}
        itemToEdit={itemToEdit}
      />

      {/* Modal Configurações */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={data.config}
        onSaveConfig={handleSaveConfig}
        onResetEmpty={handleResetEmpty}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Modal Gestão de Perfis e Acessos */}
      <PerfisModal
        isOpen={isPerfisModalOpen}
        onClose={() => setIsPerfisModalOpen(false)}
        alunosGem={alunosGem}
        currentUser={currentUser}
        onUsersChanged={(list) => {
          const pend = (list || []).filter(u => u.status === 'pendente' || u.ativo === false).length;
          setPendentesCount(pend);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Confirmar Exclusão</h3>
              <p className="text-xs text-slate-500 mt-1">
                Deseja remover <strong>{deleteCandidate.nome}</strong> ({deleteCandidate.instrumento}) da lista?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold text-white shadow-sm transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ficha Cadastral do Aluno GEM */}
      {modalAlunoGem && (
        <AlunoGemModal
          isOpen={!!modalAlunoGem}
          onClose={() => setModalAlunoGem(null)}
          alunoToEdit={modalAlunoGem}
          onSaveSuccess={() => {
            setModalAlunoGem(null);
            showToast('Ficha do aluno salva com sucesso!');
            loadData();
          }}
        />
      )}

      {/* Modal Lançamento de Lição / Prova / Histórico GEM */}
      {modalLancamentoGem && (
        <LancamentoHistoricoModal
          isOpen={!!modalLancamentoGem}
          onClose={() => setModalLancamentoGem(null)}
          alunoId={modalLancamentoGem.id}
          alunoNome={modalLancamentoGem.nome}
          instrumento={modalLancamentoGem.instrumento}
          onSaveSuccess={() => {
            setModalLancamentoGem(null);
            showToast('Atividade lançada no histórico com sucesso!');
            loadData();
          }}
        />
      )}
    </div>
  );
}
