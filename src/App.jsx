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
  Scale, 
  ListFilter,
  AlertCircle
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
import TabelaRecomendacaoExcel from './components/TabelaRecomendacaoExcel.jsx';
import FichaAlunoGemView from './components/FichaAlunoGemView.jsx';
import UniaoOrquestraGemView from './components/UniaoOrquestraGemView.jsx';
import AlunoGemModal from './components/AlunoGemModal.jsx';
import LancamentoHistoricoModal from './components/LancamentoHistoricoModal.jsx';
import { Table as TableIcon, Calendar, Music2, Sparkles, BookOpen, Layers, Shield, LogOut } from 'lucide-react';
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

  // 2 Abas Principais Simplificadas: 'corpo', 'gem'
  const [mainTab, setMainTab] = useState('corpo');
  const [subTabCorpo, setSubTabCorpo] = useState('integrantes'); // 'integrantes', 'uniao', 'relacao', 'moo_cores', 'moo_graficos'
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
      // 1. Carregar Integrantes da Orquestra
      const res = await fetch('/api/all');
      if (res.ok) {
        const json = await res.json();
        let integrs = json.integrantes || [];
        if ((!integrs || integrs.length === 0) && (json.musicos || json.organistas)) {
          integrs = [];
          if (Array.isArray(json.musicos)) {
            json.musicos.forEach(m => integrs.push({
              id: m.id || Date.now() + Math.random(),
              nome: m.nome,
              categoria: 'Músico',
              instrumento: m.instrumento || 'Violino',
              naipe: m.naipe || 'Cordas',
              situacao: m.oficializado || m.fase === 'Oficializado' ? 'Oficializado' : 'Aluno GEM / Estudos',
              telefone: m.telefone || '',
              observacao: m.observacao || ''
            }));
          }
          if (Array.isArray(json.organistas)) {
            json.organistas.forEach(o => integrs.push({
              id: o.id || Date.now() + Math.random(),
              nome: o.nome,
              categoria: 'Organista',
              instrumento: 'Órgão Eletrônico',
              naipe: 'Teclas / Organistas',
              situacao: o.oficializada || o.status === 'Oficializada' ? 'Oficializado' : 'Aluno GEM / Estudos',
              telefone: o.telefone || '',
              observacao: o.observacao || ''
            }));
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

      // 2. Carregar Alunos do GEM (União em tempo real)
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
        // Fallback local
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
    } catch (e) {
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
        showToast(`Removido localmente.`);
      }
    } catch (e) {
      setData(prev => ({
        ...prev,
        integrantes: prev.integrantes.filter(i => i.id !== deleteCandidate.id)
      }));
      showToast(`Removido localmente.`);
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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
  const metaMoo = data.config?.quantidadeDesejada || 32;

  if (!currentUser && authChecked) {
    return (
      <LoginView
        localidade={data.config?.localidade}
        cidade={data.config?.cidade}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] print:bg-white print:min-h-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slideUp no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header / Navbar */}
      <header className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Locality */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-inner">
              <Music className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                  SAM MUSICAL
                </span>
                <span className="bg-blue-800 text-blue-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-700">
                  CCB
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-medium flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                {data.config?.localidade || 'Vila Rui Barbosa'} • {data.config?.cidade || 'Jundiaí - SP'}
              </p>
            </div>
          </div>

          {/* Quick Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
            {/* Badge de Perfil Conectado */}
            {currentUser && (
              <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${roleMeta.badgeClass}`}>
                <Shield className="w-3.5 h-3.5" />
                <span>{roleMeta.shortLabel}</span>
                <span className="opacity-70 font-medium hidden lg:inline">• {currentUser.nome}</span>
              </div>
            )}

            {/* Meta MOO pill */}
            {permissoes.canViewCorpoMusical && (
              <div className="hidden md:flex items-center bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-blue-200 mr-1.5 font-medium">Orquestra:</span>
                <span className="font-bold text-white bg-blue-600 px-2 py-0.5 rounded text-[11px]">
                  {musicosCount} músicos • {organistasCount} organistas
                </span>
              </div>
            )}

            {/* Perfis e Acessos (Somente ADM) */}
            {permissoes.canManageUsers && (
              <button
                onClick={() => setIsPerfisModalOpen(true)}
                title="Aprovar cadastros e gerenciar permissões de Encarregado, Instrutores, Candidatos e Pais"
                className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-400/30 transition"
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Acessos</span>
                {pendentesCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendentesCount}
                  </span>
                )}
              </button>
            )}

            {/* Imprimir */}
            <button
              onClick={() => window.print()}
              title="Imprimir relatório"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {/* Configurações (Somente Encarregado/ADM) */}
            {permissoes.canManageConfig && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                title="Configurações e Gerenciamento de Dados"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Settings className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden sm:inline">Ajustes</span>
              </button>
            )}

            {/* Atualizar */}
            <button
              onClick={loadData}
              disabled={loading}
              title="Atualizar dados"
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Sair / Trocar Perfil */}
            {currentUser && (
              <button
                onClick={handleLogout}
                title="Sair ou trocar perfil"
                className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-400/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6 print:p-0 print:max-w-none print:space-y-4">
        {permissoes.isCandidato ? (
          <PortalCandidatoView user={currentUser} alunosGem={alunosGem} />
        ) : (
        <>
        {/* KPI Summary Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Corpo Musical Vila Rui Barbosa
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Planilha Oficial
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {musicosCount} Músicos ({oficializadosCount - (organistasCount > 0 ? 8 : 0)} Ofic.) • {organistasCount} Organistas (8 Ofic. / 3 Cultos-RJM)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Geral</span>
                <span className="font-extrabold text-slate-800 text-sm">{total} integrantes</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Oficializados</span>
                <span className="font-extrabold text-emerald-900 text-sm">{oficializadosCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-amber-700 block text-[10px] uppercase font-bold">Cultos/RJM/GEM</span>
                <span className="font-extrabold text-amber-900 text-sm">{alunosCount}</span>
              </div>
            </div>

            {permissoes.canEditCorpoMusical && (
              <button
                onClick={() => {
                  setItemToEdit(null);
                  setIsIntegranteModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Novo Integrante</span>
              </button>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL SIMPLIFICADA */}
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center gap-2 w-full shadow-inner no-print">
          {permissoes.canViewCorpoMusical && (
            <button
              onClick={() => {
                setMainTab('corpo');
                loadData();
              }}
              className={`flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                mainTab === 'corpo'
                  ? 'bg-blue-600 text-white shadow-md scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>1. Corpo Musical ({totalUnificadoCount})</span>
            </button>
          )}

          {permissoes.canViewGemFull && (
            <button
              onClick={() => {
                setMainTab('gem');
                loadData();
              }}
              className={`flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                mainTab === 'gem'
                  ? 'bg-blue-600 text-white shadow-md scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. GEM & Estudos ({alunosGem.length})</span>
            </button>
          )}
        </div>

        {/* Content View Baseado nas 2 Abas Principais */}
        {mainTab === 'corpo' ? (
          <div className="space-y-5">
            {/* Sub-navegação interna do Corpo Musical (inclui Relação Analítica e Balanço MOO) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs no-print">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSubTabCorpo('integrantes')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition ${
                    subTabCorpo === 'integrantes'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Lista de Integrantes
                </button>
                <button
                  onClick={() => setSubTabCorpo('uniao')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1.5 ${
                    subTabCorpo === 'uniao'
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>🏛️ Painel Geral & União GEM</span>
                </button>
                <button
                  onClick={() => setSubTabCorpo('relacao')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition ${
                    subTabCorpo === 'relacao'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📑 Relação Analítica
                </button>
                <button
                  onClick={() => setSubTabCorpo('moo_graficos')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition ${
                    subTabCorpo === 'moo_graficos'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📊 Gráficos MOO, Naipes & Vozes
                </button>
              </div>

              <span className="text-xs text-slate-400 font-semibold hidden xl:inline">
                {subTabCorpo === 'integrantes' ? 'Cartões e tabela oficial' :
                 subTabCorpo === 'uniao' ? 'Pipeline e diagnóstico integrado' :
                 subTabCorpo === 'relacao' ? 'Modelo analítico da congregação' :
                 'Gráficos com proporções da apostila MOO'}
              </span>
            </div>

            {subTabCorpo === 'integrantes' ? (
              <div className="space-y-6">
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
              <div className="space-y-4 flex flex-col items-center py-4">
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
            {/* Sub-navegação interna discreta do GEM */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs no-print">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSubTabGem('fichas')}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-extrabold transition ${
                    subTabGem === 'fichas'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👤 Fichas & Histórico ({alunosGem.length})
                </button>
                <button
                  onClick={() => setSubTabGem('presenca')}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-extrabold transition ${
                    subTabGem === 'presenca'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📅 Presença & Chamada (2026 / 2027)
                </button>
                <button
                  onClick={() => setSubTabGem('organistas')}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-extrabold transition ${
                    subTabGem === 'organistas'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎹 Organistas GEM
                </button>
                <button
                  onClick={() => setSubTabGem('aulas')}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-extrabold transition ${
                    subTabGem === 'aulas'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎼 Relação Aula Musical
                </button>
              </div>

              <span className="text-xs text-slate-400 font-semibold hidden md:inline">
                {subTabGem === 'fichas' ? 'Cadastro e histórico de lições/provas' :
                 subTabGem === 'presenca' ? 'Frequência das aulas de 2026' : 'Aulas musicais e organistas'}
              </span>
            </div>

            {subTabGem === 'fichas' ? (
              <FichaAlunoGemView canEdit={permissoes.canEditGem} canDelete={permissoes.canDeleteGem} onRefresh={loadData} />
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
