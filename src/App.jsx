import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  BarChart3,
  FileSpreadsheet,
  Piano,
  GraduationCap,
  Download,
  Smartphone,
  MessageSquarePlus
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
import FeedbackModal from './components/FeedbackModal.jsx';
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

  // Menu Lateral no Celular (Drawer) e Grupos Expansíveis da Barra Lateral
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    corpo: true,
    gem: true,
    gerenciamento: true
  });

  const toggleGroup = (grp) => {
    setExpandedGroups(prev => ({ ...prev, [grp]: !prev[grp] }));
  };

  // PWA Install Prompt (Celular e PC)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    setMobileMenuOpen(false);
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredInstallPrompt(null);
        showToast('Aplicativo SAM Musical instalado com sucesso!');
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
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

  // Função utilitária para propagar sincronização global (mesma aba + outras abas/janelas)
  const broadcastSyncUpdate = (detail = {}) => {
    window.dispatchEvent(new CustomEvent('gem-data-updated', { detail }));
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('sam_musical_sync');
        bc.postMessage({ type: 'SYNC', detail });
        bc.close();
      }
    } catch (e) {}
  };

  // Carregar dados da API (com suporte a carregamento silencioso em segundo plano)
  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
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
      if (!isBackground) setLoading(false);
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

    // Carregamento inicial com indicador visual
    loadData();

    // 1. Sincronização automática quando qualquer componente salvar dados
    const handleSync = () => loadData(true);
    window.addEventListener('gem-data-updated', handleSync);

    // 2. Sincronização automática imediata ao abrir o celular ou voltar para a aba do aplicativo
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(true);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 3. Sincronização periódica em segundo plano (a cada 20s enquanto a tela estiver visível)
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 20000);

    // 4. Sincronização instantânea entre abas e janelas do mesmo navegador
    let syncChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        syncChannel = new BroadcastChannel('sam_musical_sync');
        syncChannel.onmessage = (ev) => {
          if (ev?.data?.type === 'SYNC') {
            loadData(true);
          }
        };
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('gem-data-updated', handleSync);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(intervalId);
      if (syncChannel) syncChannel.close();
    };
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
        broadcastSyncUpdate(item);
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
        await loadData();
        broadcastSyncUpdate({ action: 'delete' });
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

  // Helper para garantir apenas integrantes de Vila Rui Barbosa no Corpo Musical
  const isFromRuiBarbosa = (item) => {
    const comum = (item?.comum || '').toUpperCase().trim();
    if (!comum) return true;
    return comum.includes('RUI BARBOSA') || comum.includes('VRB');
  };

  const integrantesRuiBarbosa = useMemo(() => {
    return (data.integrantes || []).filter(isFromRuiBarbosa);
  }, [data.integrantes]);

  const alunosGemRuiBarbosa = useMemo(() => {
    return (alunosGem || []).filter(isFromRuiBarbosa);
  }, [alunosGem]);

  // Indicadores gerais (exclusivos de Vila Rui Barbosa)
  const total = integrantesRuiBarbosa.length;
  const gemApenasCount = alunosGemRuiBarbosa.filter(a => !integrantesRuiBarbosa.some(i => isSamePerson(i, a))).length;
  const totalUnificadoCount = total + gemApenasCount;
  const musicosCount = integrantesRuiBarbosa.filter(i => i.categoria === 'Músico').length;
  const organistasCount = integrantesRuiBarbosa.filter(i => i.categoria === 'Organista').length;
  const oficializadosCount = integrantesRuiBarbosa.filter(i => i.oficializado === true).length;
  const alunosCount = integrantesRuiBarbosa.filter(i => !i.oficializado).length;

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

  // Conteúdo reutilizável do Menu Lateral (Lista única rolável sem botões fixos)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 select-none border-r border-slate-800/80">
      {/* Lista Única Rolável da Barra Lateral (Marca + Abas + Sub-abas + Gerenciamento) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {/* Cabeçalho da Marca dentro do fluxo da barra lateral */}
        <div className="px-2 pb-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white truncate">
                  SAM MUSICAL
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-400/30 shrink-0">
                  CCB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                {data.config?.localidade || 'Vila Rui Barbosa'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CORPO MUSICAL */}
        {!permissoes.isCandidato && permissoes.canViewCorpoMusical && (
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('corpo')}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>1. Corpo Musical</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="bg-blue-500/15 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30">
                  {totalUnificadoCount}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    expandedGroups.corpo ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            {expandedGroups.corpo && (
              <div className="pl-2.5 ml-2.5 border-l border-slate-800 space-y-1 pt-0.5">
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
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="text-sm leading-none">{item.emoji}</span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. GEM & ESTUDOS */}
        {!permissoes.isCandidato && permissoes.canViewGemFull && (
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('gem')}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>2. GEM & Estudos</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-500/15 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {alunosGem.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    expandedGroups.gem ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            {expandedGroups.gem && (
              <div className="pl-2.5 ml-2.5 border-l border-slate-800 space-y-1 pt-0.5">
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
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="text-sm leading-none">{item.emoji}</span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. GERENCIAMENTO & SISTEMA (Integrado na lista da barra lateral, sem ficar fixo) */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => toggleGroup('gerenciamento')}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>3. Gerenciamento</span>
            </span>
            <div className="flex items-center gap-1.5">
              {pendentesCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendentesCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  expandedGroups.gerenciamento ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>
          </button>

          {expandedGroups.gerenciamento && (
            <div className="pl-2.5 ml-2.5 border-l border-slate-800 space-y-1 pt-0.5">
              {permissoes.canManageUsers && (
                <button
                  onClick={() => {
                    setIsPerfisModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-amber-200 hover:text-white hover:bg-slate-900 transition"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Gestão de Acessos</span>
                  </span>
                  {pendentesCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendentesCount} pend.
                    </span>
                  )}
                </button>
              )}

              {permissoes.canManageConfig && (
                <button
                  onClick={() => {
                    setIsConfigModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  <Settings className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">Ajustes e Backup</span>
                </button>
              )}

              <button
                onClick={handleInstallApp}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-300 hover:text-white hover:bg-slate-900 transition"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Instalar App (Celular / PC)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.print();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                <Printer className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Imprimir Página Atual</span>
              </button>

              <button
                onClick={() => {
                  loadData();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 shrink-0 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                <span className="truncate">Sincronizar Dados</span>
              </button>

              <button
                onClick={() => {
                  setIsFeedbackModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white hover:bg-slate-900 transition"
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Ajude a Melhorar (Feedback)</span>
              </button>

              {/* Conta Conectada + Botão Sair dentro de Gerenciamento */}
              {currentUser && (
                <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2 px-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border ${roleMeta.badgeClass}`}>
                        {roleMeta.shortLabel}
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-1">{currentUser.nome}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-red-500/30 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
              {permissoes.canManageUsers && pendentesCount > 0 && (
                <button
                  onClick={() => setIsPerfisModalOpen(true)}
                  className="relative p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200"
                  title="Solicitações de acesso pendentes"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {pendentesCount}
                  </span>
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
                        integrantes={integrantesRuiBarbosa}
                        activeNaipeFilter={activeNaipeFilter}
                        onSelectNaipe={setActiveNaipeFilter}
                      />
                      <UnifiedTable
                        integrantes={integrantesRuiBarbosa}
                        alunosGem={alunosGemRuiBarbosa}
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
            broadcastSyncUpdate({ action: 'aluno-saved' });
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
            broadcastSyncUpdate({ action: 'historico-saved' });
          }}
        />
      )}

      {/* Modal Guia de Instalação do Aplicativo (Celular e PC) */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-sm sm:text-base">Instalar Aplicativo SAM Musical</h3>
                  <p className="text-[11px] text-blue-200/80">Funciona como App nativo no Celular e no Computador</p>
                </div>
              </div>
              <button onClick={() => setIsInstallModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-black text-emerald-900 block text-xs">📱 No Celular Android (Chrome):</span>
                <p>
                  Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do navegador e selecione{' '}
                  <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-black text-blue-900 block text-xs">🍎 No iPhone / iPad (Safari):</span>
                <p>
                  Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior) e escolha{' '}
                  <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block text-xs">💻 No Computador (Chrome ou Edge):</span>
                <p>
                  Clique no ícone de <strong>Instalar (🖥️ com setinha)</strong> que aparece no canto direito da barra de endereço do navegador (ao lado da estrela de favoritos).
                </p>
              </div>

              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs transition"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante de Feedback / Ajude a Melhorar */}
      <button
        type="button"
        onClick={() => setIsFeedbackModalOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-full shadow-xl border border-amber-300/40 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 no-print cursor-pointer"
        title="Ajude a melhorar o sistema enviando uma sugestão ou relato"
      >
        <Sparkles className="w-4 h-4 text-slate-950" />
        <span className="hidden sm:inline">Ajude a Melhorar</span>
        <span className="sm:hidden font-extrabold">Feedback</span>
      </button>

      {/* Modal de Feedback do Usuário */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
