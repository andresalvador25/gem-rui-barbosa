import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown,
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Music, 
  UserPlus, 
  Edit3, 
  Calendar,
  Layers,
  Scale,
  X,
  Check
} from 'lucide-react';
import { GRADE_OFICIAL_MOO } from '../constants/mooStandard.js';
import AlunoGemModal from './AlunoGemModal.jsx';
import { isMatchInstrumento } from '../utils/instrumentMatcher.js';
import LancamentoHistoricoModal from './LancamentoHistoricoModal.jsx';
import { detectarNaipe } from '../constants/instruments.js';
import { NIVEIS_MUSICAL, isSamePerson, mergeIntegranteWithGem, formatInstrumentName, flagsFromNivel, nivelFromFlags } from '../utils/gemSync.js';

export default function UniaoOrquestraGemView({ 
  integrantes = [], 
  alunosGem = [], 
  onRefresh,
  onOpenIntegranteModal,
  canPromote = true
}) {
  const [busca, setBusca] = useState('');
  const [filtroNaipe, setFiltroNaipe] = useState('Todos');
  const [filtroEstagio, setFiltroEstagio] = useState('Todos'); // 'Todos', 'gem', 'rjm', 'cultos', 'oficializados'
  const [filtrosNivel, setFiltrosNivel] = useState([]); // Array de níveis selecionados (múltipla escolha)
  const [isNivelDropdownOpen, setIsNivelDropdownOpen] = useState(false);
  const nivelDropdownRef = useRef(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos'); // 'Todos', 'Músico', 'Organista'
  const [selectedInstrumento, setSelectedInstrumento] = useState('Todos');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (nivelDropdownRef.current && !nivelDropdownRef.current.contains(e.target)) {
        setIsNivelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFiltroNivel = (nivel) => {
    setFiltrosNivel(prev =>
      prev.includes(nivel) ? prev.filter(n => n !== nivel) : [...prev, nivel]
    );
  };

  // Modais
  const [alunoFicha, setAlunoFicha] = useState(null);
  const [alunoLancamento, setAlunoLancamento] = useState(null);
  const [alunoPromover, setAlunoPromover] = useState(null);
  const [promocaoNivel, setPromocaoNivel] = useState('REUNIÃO DE JOVENS');
  const [promocaoSaving, setPromocaoSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Normalizador de texto para cruzar dados
  const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  // Consolidação Unificada dos Integrantes e Alunos do GEM
  const listaUnificada = useMemo(() => {
    const list = [];
    const processedGemIds = new Set();

    // 1. Integrantes da Orquestra sincronizados em tempo real com o GEM
    integrantes.forEach(intg => {
      const gemMatch = alunosGem.find(a => isSamePerson(intg, a));

      if (gemMatch) {
        processedGemIds.add(gemMatch.id);
        const merged = mergeIntegranteWithGem(intg, gemMatch);
        list.push({
          ...merged,
          id: intg.id,
          gemId: gemMatch.id,
          origem: 'AMBOS',
          nivelGem: merged.nivel,
          dadosGemCompletos: gemMatch,
          dadosOrquestraCompletos: merged
        });
      } else {
        const nivelGem = nivelFromFlags(intg);
        list.push({
          ...intg,
          nivel: nivelGem,
          origem: 'ORQUESTRA',
          nivelGem,
          dadosOrquestraCompletos: intg
        });
      }
    });

    // 2. Alunos do GEM ainda não integrantes da Orquestra
    alunosGem.forEach(aluno => {
      if (!processedGemIds.has(aluno.id)) {
        const categoria = String(aluno.cargo || '').toUpperCase() === 'ORGANISTA' ? 'Organista' : 'Músico';
        const instrumento = formatInstrumentName(aluno.instrumento, categoria);
        const naipe = detectarNaipe(instrumento, categoria);
        const nivelGem = String(aluno.nivel || 'CANDIDATO(A)').toUpperCase().trim();
        const flags = flagsFromNivel(nivelGem, false);

        list.push({
          id: 'gem-' + aluno.id,
          gemId: aluno.id,
          nome: aluno.nome,
          categoria,
          instrumento,
          naipe,
          oficializado: flags.oficializado,
          rjm: flags.rjm,
          cultosOficiais: flags.cultosOficiais,
          ensaios: flags.ensaios,
          meiaHora: flags.meiaHora,
          telefone: '',
          observacao: aluno.observacoes || '',
          origem: 'GEM',
          nivelGem,
          dataInicioGem: aluno.dataInicioGem || '',
          tonalidade: aluno.tonalidade || '',
          dadosGemCompletos: aluno
        });
      }
    });

    return list;
  }, [integrantes, alunosGem]);

  // Indicadores Gerais Unificados
  const totalGeral = listaUnificada.length;
  const totalOficializados = listaUnificada.filter(i => i.oficializado).length;
  const totalCultosOficiais = listaUnificada.filter(i => !i.oficializado && i.cultosOficiais).length;
  const totalRjm = listaUnificada.filter(i => i.rjm || (i.nivelGem && i.nivelGem.includes('RJM'))).length;
  const totalGemPuro = listaUnificada.filter(i => !!i.gemId || i.origem === 'GEM' || i.origem === 'AMBOS').length;
  const totalAlunosGemAtivos = alunosGem.length;
  const quadroRef = useRef(null);

  // Grade Oficial MOO (base 32 da congregação)
  const metaGrade = GRADE_OFICIAL_MOO[32]?.instrumentos || {};

  // Matriz de Suprimento da Orquestra pelo GEM (24 Instrumentos da CCB)
  const instrumentosMatriz = useMemo(() => {
    const lista = [
      { nome: 'VIOLINO', naipe: 'Cordas', voz: 'Soprano' },
      { nome: 'VIOLA', naipe: 'Cordas', voz: 'Contralto' },
      { nome: 'VIOLONCELO', naipe: 'Cordas', voz: 'Baixo' },

      { nome: 'FLAUTA', naipe: 'Madeiras', voz: 'Soprano' },
      { nome: 'OBOÉ', naipe: 'Madeiras', voz: 'Soprano' },
      { nome: "OBOÉ D'AMORE", naipe: 'Madeiras', voz: 'Soprano' },
      { nome: 'CORNE INGLÊS', naipe: 'Madeiras', voz: 'Contralto' },
      { nome: 'FAGOTE', naipe: 'Madeiras', voz: 'Baixo' },
      { nome: 'CLARINETE', naipe: 'Madeiras', voz: 'Soprano' },
      { nome: 'CLARINETE ALTO', naipe: 'Madeiras', voz: 'Contralto' },
      { nome: 'CLARINETE BAIXO', naipe: 'Madeiras', voz: 'Baixo' },
      { nome: 'SAXOFONE SOPRANO', naipe: 'Madeiras', voz: 'Soprano' },
      { nome: 'SAXOFONE ALTO', naipe: 'Madeiras', voz: 'Contralto' },
      { nome: 'SAXOFONE TENOR', naipe: 'Madeiras', voz: 'Tenor' },
      { nome: 'SAXOFONE BARÍTONO', naipe: 'Madeiras', voz: 'Baixo' },

      { nome: 'TROMPETE', naipe: 'Metais', voz: 'Soprano' },
      { nome: 'CORNET', naipe: 'Metais', voz: 'Soprano' },
      { nome: 'FLUGELHORN', naipe: 'Metais', voz: 'Soprano' },
      { nome: 'TROMPA', naipe: 'Metais', voz: 'Contralto' },
      { nome: 'TROMBONITO', naipe: 'Metais', voz: 'Tenor' },
      { nome: 'TROMBONE', naipe: 'Metais', voz: 'Tenor' },
      { nome: 'EUFÔNIO', naipe: 'Metais', voz: 'Baixo' },
      { nome: 'BARÍTONO SIb', naipe: 'Metais', voz: 'Baixo' },
      { nome: 'TUBA', naipe: 'Metais', voz: 'Baixo' }
    ];

    return lista.map(item => {
      // Músicos na Orquestra Oficializada
      const oficQtd = integrantes.filter(i => {
        if (i.categoria !== 'Músico' || !i.oficializado) return false;
        return isMatchInstrumento(item.nome, i.instrumento);
      }).length;

      // Músicos em Atividade (Cultos Oficiais e RJM)
      const emAtividadeNaoOfic = integrantes.filter(i => {
        if (i.categoria !== 'Músico' || i.oficializado) return false;
        return isMatchInstrumento(item.nome, i.instrumento);
      }).length;

      // Alunos no GEM estudando este instrumento
      const alunosDoInst = alunosGem.filter(a => isMatchInstrumento(item.nome, a.instrumento));

      const gemQtd = alunosDoInst.length;
      const meta = metaGrade[item.nome] || 0;
      const totalProjetado = oficQtd + emAtividadeNaoOfic + gemQtd;
      const saldoAtual = oficQtd - meta;
      const saldoProjetado = totalProjetado - meta;

      // Diagnóstico Inteligente
      let statusTipo = 'neutro';
      let statusLabel = 'Em Análise';

      if (meta === 0) {
        statusTipo = 'opcional';
        statusLabel = totalProjetado > 0 ? `${totalProjetado} Solistas/Opcional` : 'Sem demanda fixa';
      } else if (oficQtd >= meta) {
        statusTipo = 'equilibrado';
        statusLabel = '🟢 Equilibrado';
      } else if (totalProjetado >= meta) {
        statusTipo = 'suprido_gem';
        statusLabel = '🟡 Suprido pelo GEM!';
      } else if (gemQtd === 0 && oficQtd < meta) {
        statusTipo = 'critico';
        statusLabel = '🔴 Carência Crítica (Incentivar Alunos!)';
      } else {
        statusTipo = 'em_estudo';
        statusLabel = '🟠 Em Formação';
      }

      return {
        ...item,
        oficQtd,
        emAtividadeNaoOfic,
        orquestraTotal: oficQtd + emAtividadeNaoOfic,
        gemQtd,
        alunosNomes: alunosDoInst.map(a => a.nome),
        meta,
        totalProjetado,
        saldoAtual,
        saldoProjetado,
        statusTipo,
        statusLabel
      };
    });
  }, [integrantes, alunosGem, metaGrade]);

  // Filtragem da lista unificada
  const listaFiltrada = useMemo(() => {
    return listaUnificada.filter(item => {
      // Busca
      if (busca.trim()) {
        const q = busca.toLowerCase().trim();
        const nomeMatch = (item.nome || '').toLowerCase().includes(q);
        const instMatch = (item.instrumento || '').toLowerCase().includes(q);
        const telMatch = (item.telefone || '').includes(q);
        if (!nomeMatch && !instMatch && !telMatch) return false;
      }

      // Naipe
      if (filtroNaipe !== 'Todos' && item.naipe !== filtroNaipe) return false;

      // Categoria
      if (filtroCategoria !== 'Todos' && item.categoria !== filtroCategoria) return false;

      // Instrumento selecionado na matriz
      if (selectedInstrumento !== 'Todos') {
        const instItem = (item.instrumento || '').toLowerCase();
        const selLow = selectedInstrumento.toLowerCase();
        if (!instItem.includes(selLow) && !selLow.includes(instItem)) return false;
      }

      // Estágio
      if (filtroEstagio === 'oficializados' && !item.oficializado) return false;
      if (filtroEstagio === 'cultos' && (item.oficializado || !item.cultosOficiais)) return false;
      if (filtroEstagio === 'rjm' && !(item.rjm || (item.nivelGem && item.nivelGem.includes('RJM')))) return false;
      if (filtroEstagio === 'gem' && !(!!item.gemId || item.origem === 'GEM' || item.origem === 'AMBOS')) return false;

      // Múltiplos Níveis
      if (filtrosNivel.length > 0) {
        const niv = item.nivelGem || item.nivel || nivelFromFlags(item);
        if (!filtrosNivel.includes(niv)) return false;
      }

      return true;
    });
  }, [listaUnificada, busca, filtroNaipe, filtroCategoria, filtroEstagio, filtrosNivel, selectedInstrumento]);

  // Executar Promoção de Aluno do GEM para a Orquestra
  const handleConfirmarPromocao = async () => {
    if (!alunoPromover) return;
    setPromocaoSaving(true);
    try {
      const res = await fetch('/api/gem/promover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: alunoPromover.gemId || alunoPromover.id,
          novoNivel: promocaoNivel,
          cargo: alunoPromover.categoria === 'Organista' ? 'ORGANISTA' : 'MÚSICO'
        })
      });

      if (res.ok) {
        showToast(`🎉 ${alunoPromover.nome} promovido(a) para ${promocaoNivel} com sucesso!`);
        setAlunoPromover(null);
        if (onRefresh) onRefresh();
      } else {
        showToast('Não foi possível salvar a promoção no servidor.', 'error');
      }
    } catch (e) {
      showToast('Erro ao conectar ao servidor para promover aluno.', 'error');
    } finally {
      setPromocaoSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Banner de Boas-Vindas à União */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Visão Integrada Oficial • Congregação Cristã no Brasil</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              União Geral: Orquestra & Grupo de Estudos Musicais (GEM)
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
              O ecossistema musical completo da congregação: acompanhe a evolução de cada aluno desde os primeiros métodos no GEM até sua consagração e atuação plena no corpo orquestral.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFiltroEstagio('Todos');
                setFiltrosNivel([]);
                setSelectedInstrumento('Todos');
              }}
              title="Clique para exibir todos os integrantes e alunos"
              className={`backdrop-blur-md border p-4 rounded-2xl flex items-center gap-3.5 text-white text-left transition cursor-pointer ${
                filtroEstagio === 'Todos' && filtrosNivel.length === 0
                  ? 'bg-white/20 border-white/50 ring-2 ring-white/40 shadow-lg'
                  : 'bg-white/10 hover:bg-white/15 border-white/20'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/60 flex items-center justify-center text-white shadow-inner">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-blue-200 text-[11px] uppercase font-bold tracking-wider block">Corpo Musical Total</span>
                <span className="text-2xl font-black text-white">{totalGeral}</span>
                <span className="text-[10px] text-blue-200 block">Clique p/ exibir todos</span>
              </div>
            </button>
          </div>
        </div>

        {/* 4 Botões de Filtro Rápidos (Interativos e Sem Duplicidade) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setFiltroEstagio(filtroEstagio === 'oficializados' ? 'Todos' : 'oficializados')}
            className={`rounded-xl p-3.5 text-left transition cursor-pointer border ${
              filtroEstagio === 'oficializados'
                ? 'bg-blue-600/50 border-blue-300 ring-2 ring-blue-300/60 shadow-lg'
                : 'bg-white/5 hover:bg-white/15 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-blue-300 block text-[10px] uppercase font-bold">Oficializados</span>
              {filtroEstagio === 'oficializados' && <Check className="w-3.5 h-3.5 text-blue-200" />}
            </div>
            <span className="text-xl font-black text-white">{totalOficializados}</span>
            <span className="text-[10px] text-slate-300 block">Cultos Oficiais & Ensaios (Filtrar)</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstagio(filtroEstagio === 'cultos' ? 'Todos' : 'cultos')}
            className={`rounded-xl p-3.5 text-left transition cursor-pointer border ${
              filtroEstagio === 'cultos'
                ? 'bg-emerald-600/50 border-emerald-300 ring-2 ring-emerald-300/60 shadow-lg'
                : 'bg-white/5 hover:bg-white/15 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 block text-[10px] uppercase font-bold">Cultos Oficiais (Em Teste)</span>
              {filtroEstagio === 'cultos' && <Check className="w-3.5 h-3.5 text-emerald-200" />}
            </div>
            <span className="text-xl font-black text-white">{totalCultosOficiais}</span>
            <span className="text-[10px] text-slate-300 block">Autorizados em Cultos (Filtrar)</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstagio(filtroEstagio === 'rjm' ? 'Todos' : 'rjm')}
            className={`rounded-xl p-3.5 text-left transition cursor-pointer border ${
              filtroEstagio === 'rjm'
                ? 'bg-amber-600/50 border-amber-300 ring-2 ring-amber-300/60 shadow-lg'
                : 'bg-white/5 hover:bg-white/15 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-300 block text-[10px] uppercase font-bold">Reunião de Jovens (RJM)</span>
              {filtroEstagio === 'rjm' && <Check className="w-3.5 h-3.5 text-amber-200" />}
            </div>
            <span className="text-xl font-black text-white">{totalRjm}</span>
            <span className="text-[10px] text-slate-300 block">Tocando na RJM (Filtrar)</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstagio(filtroEstagio === 'gem' ? 'Todos' : 'gem')}
            className={`rounded-xl p-3.5 text-left transition cursor-pointer border ${
              filtroEstagio === 'gem'
                ? 'bg-purple-600/50 border-purple-300 ring-2 ring-purple-300/60 shadow-lg'
                : 'bg-white/5 hover:bg-white/15 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-purple-300 block text-[10px] uppercase font-bold">GEM em Preparação</span>
              {filtroEstagio === 'gem' && <Check className="w-3.5 h-3.5 text-purple-200" />}
            </div>
            <span className="text-xl font-black text-white">{totalAlunosGemAtivos}</span>
            <span className="text-[10px] text-slate-300 block">Alunos estudando no GEM (Filtrar)</span>
          </button>
        </div>
      </div>

      {/* TABELA UNIFICADA INTERATIVA DE INTEGRANTES & ALUNOS (Logo abaixo dos botões de filtro!) */}
      <div ref={quadroRef} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Quadro Unificado de Integrantes & Alunos ({listaFiltrada.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Acesse a ficha cadastral do aluno, histórico de lições do GEM ou promova irmãos para a Orquestra
            </p>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, instrumento..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pílulas de Filtro Rápido */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Categoria */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['Todos', 'Músico', 'Organista'].map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filtroCategoria === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'Todos' ? `Todos (${listaUnificada.length})` : cat === 'Músico' ? '🎺 Músicos' : '🎹 Organistas'}
              </button>
            ))}
          </div>

          {/* Naipe */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['Todos', 'Cordas', 'Madeiras', 'Metais'].map(n => (
              <button
                key={n}
                onClick={() => setFiltroNaipe(n)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  filtroNaipe === n ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Filtro Lista de Múltipla Escolha por Nível */}
          <div className="relative flex items-center gap-1.5" ref={nivelDropdownRef}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nível:
            </span>
            <button
              type="button"
              onClick={() => setIsNivelDropdownOpen(prev => !prev)}
              className={`text-xs px-3 py-1.5 border rounded-lg font-semibold outline-none cursor-pointer flex items-center gap-2 transition ${
                filtrosNivel.length > 0
                  ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <span>
                {filtrosNivel.length === 0
                  ? 'Todos os Níveis'
                  : filtrosNivel.length === 1
                  ? filtrosNivel[0]
                  : `${filtrosNivel.length} níveis selecionados`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isNivelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNivelDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-fadeIn">
                <div className="px-3 pb-1.5 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Múltipla Escolha</span>
                  {filtrosNivel.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setFiltrosNivel([])}
                      className="text-red-600 hover:underline font-bold"
                    >
                      Limpar ({filtrosNivel.length})
                    </button>
                  ) : (
                    <span className="text-slate-400">Todos</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {NIVEIS_MUSICAL.map(nivel => {
                    const isChecked = filtrosNivel.includes(nivel);
                    const qtd = listaUnificada.filter(i => (i.nivelGem || i.nivel || nivelFromFlags(i)) === nivel).length;
                    return (
                      <label
                        key={nivel}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/70 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFiltroNivel(nivel)}
                            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>{nivel}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                          {qtd}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedInstrumento !== 'Todos' && (
            <div className="flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-xl font-bold">
              <span>Instrumento: {selectedInstrumento}</span>
              <button onClick={() => setSelectedInstrumento('Todos')} className="text-blue-700 hover:text-blue-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {(busca || filtroNaipe !== 'Todos' || filtroCategoria !== 'Todos' || filtroEstagio !== 'Todos' || filtrosNivel.length > 0 || selectedInstrumento !== 'Todos') && (
            <button
              onClick={() => {
                setBusca('');
                setFiltroNaipe('Todos');
                setFiltroCategoria('Todos');
                setFiltroEstagio('Todos');
                setFiltrosNivel([]);
                setSelectedInstrumento('Todos');
              }}
              className="text-xs text-red-600 hover:underline font-bold ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Tabela de Pessoas */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[480px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100">
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">Nome do Integrante / Aluno</th>
                <th className="py-2.5 px-3">Instrumento</th>
                <th className="py-2.5 px-3">Naipe</th>
                <th className="py-2.5 px-3">Nível / Situação</th>
                <th className="py-2.5 px-3 text-center">Origem</th>
                <th className="py-2.5 px-3 text-center">Histórico GEM</th>
                <th className="py-2.5 px-3 text-right">Ações Integradas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaFiltrada.map(item => {
                const temGem = !!item.gemId || item.origem === 'GEM' || item.origem === 'AMBOS';
                const isOfic = item.oficializado;
                const niv = item.nivelGem || item.nivel || nivelFromFlags(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span
                          onClick={() => {
                            if (temGem) {
                              setAlunoFicha(item.dadosGemCompletos || {
                                id: item.gemId,
                                nome: item.nome,
                                instrumento: item.instrumento,
                                comum: 'VILA RUI BARBOSA',
                                cargo: item.categoria === 'Organista' ? 'ORGANISTA' : 'MÚSICO',
                                nivel: item.nivelGem || 'CANDIDATO(A)',
                                possuiInstrumento: 'SIM',
                                instrumentoProprio: 'SIM',
                                tonalidade: item.tonalidade || 'DÓ',
                                dataInicioGem: item.dataInicioGem || '2024-02-03'
                              });
                            } else if (onOpenIntegranteModal && item.dadosOrquestraCompletos) {
                              onOpenIntegranteModal(item.dadosOrquestraCompletos);
                            }
                          }}
                          className="hover:text-blue-600 hover:underline cursor-pointer transition"
                          title={`Clique para abrir os dados de ${item.nome}`}
                        >
                          {item.nome}
                        </span>
                        {item.categoria === 'Organista' && (
                          <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            ORG
                          </span>
                        )}
                      </div>
                      {item.telefone && (
                        <span className="text-[10px] text-slate-400 block">{item.telefone}</span>
                      )}
                    </td>

                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {item.instrumento}
                    </td>

                    <td className="py-2 px-3 text-slate-600">
                      {item.naipe}
                    </td>

                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border ${
                        niv === 'OFICIALIZADO' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                        niv === 'RJM / OFICIALIZADO' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                        niv.includes('CULTO') ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        niv.includes('RJM') ? 'bg-amber-50 text-amber-800 border-amber-300' :
                        niv === 'ENSAIO' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                        'bg-purple-50 text-purple-800 border-purple-300'
                      }`}>
                        {niv}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.origem === 'AMBOS' ? 'bg-indigo-100 text-indigo-800' :
                        item.origem === 'ORQUESTRA' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.origem === 'AMBOS' ? 'Orquestra & GEM' : item.origem}
                      </span>
                    </td>

                    {/* Botão de Histórico do Aluno */}
                    <td className="py-2 px-3 text-center">
                      {temGem ? (
                        <button
                          onClick={() => setAlunoLancamento({
                            id: item.gemId || (typeof item.id === 'string' ? item.id.replace('gem-', '') : item.id),
                            nome: item.nome,
                            instrumento: item.instrumento
                          })}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-[10px] transition inline-flex items-center gap-1 border border-indigo-200"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>+ Lição / Prova</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">-</span>
                      )}
                    </td>

                    {/* Ações Integradas */}
                    <td className="py-2 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* Abrir Ficha Cadastral do Aluno GEM */}
                      {temGem && (
                        <button
                          onClick={() => setAlunoFicha(item.dadosGemCompletos || {
                            id: item.gemId,
                            nome: item.nome,
                            instrumento: item.instrumento,
                            comum: 'VILA RUI BARBOSA',
                            cargo: item.categoria === 'Organista' ? 'ORGANISTA' : 'MÚSICO',
                            nivel: item.nivelGem || 'CANDIDATO(A)',
                            possuiInstrumento: 'SIM',
                            instrumentoProprio: 'SIM',
                            tonalidade: item.tonalidade || 'DÓ',
                            dataInicioGem: item.dataInicioGem || '2024-02-03'
                          })}
                          title="Visualizar Ficha Cadastral do GEM"
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-lg text-[10px] border border-purple-200 transition"
                        >
                          Ficha GEM
                        </button>
                      )}

                      {/* Botão de Promoção para a Orquestra */}
                      {canPromote && !isOfic && (
                        <button
                          onClick={() => {
                            setAlunoPromover(item);
                            setPromocaoNivel(item.rjm ? 'CULTO OFICIAL' : 'RJM / ENSAIOS');
                          }}
                          title="Promover para a Orquestra"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg text-[10px] shadow-sm transition inline-flex items-center gap-1"
                        >
                          <span>🚀 Promover</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATRIZ DE SUPRIMENTO DA ORQUESTRA PELO GEM (O FUTURO DA ORQUESTRA) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>Matriz de Equilíbrio: Orquestra Atual vs Projeção com Alunos GEM</span>
            </h2>
            <p className="text-xs text-slate-500">
              Veja em tempo real como os alunos em preparação no GEM vão suprir as vagas recomendadas da Orquestra (MOO)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Legenda:</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">🟢 Equilibrado</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">🟡 Suprido pelo GEM</span>
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">🔴 Carência Crítica</span>
          </div>
        </div>

        {/* Tabela da Matriz */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">Instrumento</th>
                <th className="py-2.5 px-3">Naipe / Voz</th>
                <th className="py-2.5 px-3 text-center bg-blue-50/80 text-blue-900">Orquestra Oficial</th>
                <th className="py-2.5 px-3 text-center bg-indigo-50/80 text-indigo-900">+ Cultos/RJM</th>
                <th className="py-2.5 px-3 text-center bg-purple-50 text-purple-900 font-black">+ Alunos no GEM</th>
                <th className="py-2.5 px-3 text-center bg-emerald-50 text-emerald-900 font-black">Projeção Total</th>
                <th className="py-2.5 px-3 text-center bg-slate-200 text-slate-900">Meta MOO</th>
                <th className="py-2.5 px-3 text-center">Diagnóstico do Futuro</th>
                <th className="py-2.5 px-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instrumentosMatriz.map(item => {
                const isSelected = selectedInstrumento === item.nome;
                return (
                  <tr 
                    key={item.nome}
                    className={`transition hover:bg-blue-50/30 ${isSelected ? 'bg-blue-100/60 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{item.nome}</span>
                      {item.gemQtd > 0 && (
                        <span 
                          title={`Alunos no GEM: ${item.alunosNomes.join(', ')}`}
                          className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded font-bold cursor-help"
                        >
                          +{item.gemQtd} GEM
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-slate-500">
                      <span className="font-medium text-slate-700">{item.naipe}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({item.voz})</span>
                    </td>

                    {/* Orquestra Oficial */}
                    <td className="py-2 px-3 text-center font-bold text-blue-900 bg-blue-50/30">
                      {item.oficQtd}
                    </td>

                    {/* Em Atividade Cultos/RJM */}
                    <td className="py-2 px-3 text-center font-medium text-indigo-900 bg-indigo-50/30">
                      {item.emAtividadeNaoOfic > 0 ? `+${item.emAtividadeNaoOfic}` : '-'}
                    </td>

                    {/* Alunos no GEM */}
                    <td className="py-2 px-3 text-center font-black text-purple-700 bg-purple-50/50">
                      {item.gemQtd > 0 ? (
                        <span 
                          title={item.alunosNomes.join(', ')}
                          className="inline-flex items-center gap-1 bg-purple-200/80 px-2 py-0.5 rounded-full cursor-help"
                        >
                          <BookOpen className="w-3 h-3 text-purple-600" />
                          {item.gemQtd}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Projeção Total */}
                    <td className="py-2 px-3 text-center font-black text-emerald-800 bg-emerald-50/50 text-sm">
                      {item.totalProjetado}
                    </td>

                    {/* Meta Recomendada MOO */}
                    <td className="py-2 px-3 text-center font-extrabold text-slate-700 bg-slate-100">
                      {item.meta > 0 ? item.meta : <span className="text-slate-400 font-normal">Opcional</span>}
                    </td>

                    {/* Diagnóstico Inteligente */}
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.statusTipo === 'equilibrado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        item.statusTipo === 'suprido_gem' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' :
                        item.statusTipo === 'critico' ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' :
                        item.statusTipo === 'opcional' ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.statusLabel}
                      </span>
                    </td>

                    {/* Botão de Filtro Rápido */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => {
                          const next = isSelected ? 'Todos' : item.nome;
                          setSelectedInstrumento(next);
                          if (next !== 'Todos' && quadroRef.current) {
                            quadroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Limpar' : 'Ver Pessoas'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PROMOÇÃO DE ALUNO DO GEM PARA A ORQUESTRA */}
      {alunoPromover && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider block">Transição GEM ➔ Orquestra</span>
                <h3 className="text-lg font-black">{alunoPromover.nome}</h3>
                <span className="text-xs text-white/90 font-medium">{alunoPromover.instrumento} • {alunoPromover.categoria}</span>
              </div>
              <button onClick={() => setAlunoPromover(null)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Selecione o novo estágio do aluno no ministério da música. Ao confirmar, o aluno será integrado automaticamente à lista oficial da Orquestra e seu cadastro no GEM será atualizado:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <label className="text-xs font-bold text-slate-700 block">Novo Estágio / Nível:</label>

                {[
                  { id: 'CULTO OFICIAL', label: '⛪ Culto Oficial', desc: 'Autorizado a tocar nos Cultos Oficiais (não RJM)' },
                  { id: 'ENSAIO', label: '🎼 Ensaio', desc: 'Liberado para tocar nos ensaios musicais' },
                  { id: 'OFICIALIZADO', label: '⭐ Oficializado', desc: 'Oficializado(a) pleno (não toca RJM)' },
                  { id: 'RJM / CULTOS OFICIAIS', label: '⛪ RJM / Cultos Oficiais', desc: 'Jovem que toca na RJM e nos Cultos Oficiais' },
                  { id: 'RJM / ENSAIOS', label: '🎵 RJM / Ensaios', desc: 'Jovem liberado para tocar na RJM e nos Ensaios' },
                  { id: 'RJM / OFICIALIZADO', label: '🌟 RJM / Oficializado', desc: 'Oficializado(a) que ainda toca na RJM (jovem)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPromocaoNivel(opt.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      promocaoNivel === opt.id
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.desc}</span>
                    </div>
                    {promocaoNivel === opt.id && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAlunoPromover(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={promocaoSaving}
                  onClick={handleConfirmarPromocao}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  {promocaoSaving ? 'Salvando...' : 'Confirmar Promoção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ficha Cadastral do Aluno */}
      {alunoFicha && (
        <AlunoGemModal
          isOpen={!!alunoFicha}
          onClose={() => setAlunoFicha(null)}
          alunoToEdit={alunoFicha}
          onSaveSuccess={() => {
            setAlunoFicha(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Modal Lançamento de Lição / Prova / Histórico */}
      {alunoLancamento && (
        <LancamentoHistoricoModal
          isOpen={!!alunoLancamento}
          onClose={() => setAlunoLancamento(null)}
          alunoId={alunoLancamento.id}
          alunoNome={alunoLancamento.nome}
          instrumento={alunoLancamento.instrumento}
          onSaveSuccess={() => {
            setAlunoLancamento(null);
            showToast('Atividade lançada no histórico com sucesso!');
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
