import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Trash2, 
  Phone, 
  UserPlus, 
  Filter, 
  Check, 
  X,
  BookOpen,
  Sparkles,
  ChevronDown,
  MapPin,
  Music2,
  Users
} from 'lucide-react';
import { detectarNaipe } from '../constants/instruments.js';
import { NIVEIS_MUSICAL, isSamePerson, mergeIntegranteWithGem, formatInstrumentName, flagsFromNivel, nivelFromFlags } from '../utils/gemSync.js';

export default function UnifiedTable({ 
  integrantes = [], 
  alunosGem = [],
  onOpenAlunoFicha,
  onOpenAlunoLancamento,
  onAddClick, 
  onEditClick, 
  onDeleteClick, 
  activeNaipeFilter, 
  onSelectNaipe,
  readOnly = false,
  initialFilter = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos'); // 'Todos', 'Músico', 'Organista', 'GEM'
  const [filtroOficializado, setFiltroOficializado] = useState('Todos'); // 'Todos', 'Oficializado', 'NaoOficializado', 'RJM'
  const [filtrosNivel, setFiltrosNivel] = useState([]); // Array de níveis selecionados
  const [isNivelDropdownOpen, setIsNivelDropdownOpen] = useState(false);
  const nivelDropdownRef = useRef(null);
  const [filtroInstrumento, setFiltroInstrumento] = useState('Todos');
  const [sortField, setSortField] = useState('instrumento');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Suporte a filtro inicial vindo da Relação Analítica
  useEffect(() => {
    if (!initialFilter) return;
    if (initialFilter === 'musicos_ofic') {
      setFiltroCategoria('Músico');
      setFiltroOficializado('Oficializado');
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'musicos_nao_ofic') {
      setFiltroCategoria('Músico');
      setFiltroOficializado('NaoOficializado');
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'organistas_ofic') {
      setFiltroCategoria('Organista');
      setFiltroOficializado('Oficializado');
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'organistas_nao_ofic') {
      setFiltroCategoria('Organista');
      setFiltroOficializado('NaoOficializado');
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'total_musicos') {
      setFiltroCategoria('Músico');
      setFiltroOficializado('Todos');
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'total_organistas') {
      setFiltroCategoria('Organista');
      setFiltroOficializado('Todos');
      if (onSelectNaipe) onSelectNaipe('Todos');
    }
  }, [initialFilter]);

  // Helper seguro para garantir estritamente integrantes de Vila Rui Barbosa
  const isFromRuiBarbosa = (item) => {
    const comum = (item?.comum || '').toUpperCase().trim();
    if (!comum) return true; // Se não informado, pertence à congregação local padrão (Vila Rui Barbosa)
    return comum.includes('RUI BARBOSA') || comum.includes('VRB');
  };

  // Helper seguro para localizar o aluno correspondente no GEM
  const getAlunoGem = (itemOrNome) => {
    if (!itemOrNome || !alunosGem || alunosGem.length === 0) return null;
    const target = typeof itemOrNome === 'string' ? { nome: itemOrNome } : itemOrNome;
    return alunosGem.find(a => isSamePerson(target, a)) || null;
  };

  // Lista consolidada e linkada em tempo real (EXCLUSIVA DE VILA RUI BARBOSA)
  const listaConsolidada = useMemo(() => {
    const usedGemIds = new Set();
    const merged = [];

    // 1. Integrantes cadastrados no Corpo Musical
    (integrantes || []).forEach(intg => {
      const aluno = (alunosGem || []).find(a => isSamePerson(intg, a));
      if (aluno) usedGemIds.add(aluno.id);
      const consolidated = {
        ...mergeIntegranteWithGem(intg, aluno),
        alunoGemRef: aluno || null
      };
      if (isFromRuiBarbosa(consolidated)) {
        merged.push(consolidated);
      }
    });

    // 2. Alunos e Candidatos do GEM de Vila Rui Barbosa que ainda não constavam no Corpo Musical
    (alunosGem || []).forEach(aluno => {
      if (!usedGemIds.has(aluno.id) && isFromRuiBarbosa(aluno)) {
        const categoria = String(aluno.cargo || '').toUpperCase() === 'ORGANISTA' ? 'Organista' : 'Músico';
        const instrumento = formatInstrumentName(aluno.instrumento, categoria);
        const naipe = detectarNaipe(instrumento, categoria);
        const nivel = String(aluno.nivel || 'CANDIDATO(A)').toUpperCase().trim();
        const flags = flagsFromNivel(nivel, false);
        merged.push({
          id: `gem-${aluno.id}`,
          gemId: aluno.id,
          nome: aluno.nome,
          categoria,
          instrumento,
          naipe,
          nivel,
          comum: aluno.comum || 'VILA RUI BARBOSA',
          possuiInstrumento: aluno.possuiInstrumento || 'SIM',
          instrumentoProprio: aluno.instrumentoProprio || 'SIM',
          tonalidade: aluno.tonalidade || 'DÓ',
          dataInicioGem: aluno.dataInicioGem || '',
          ensaios: flags.ensaios,
          rjm: flags.rjm,
          meiaHora: flags.meiaHora,
          cultosOficiais: flags.cultosOficiais,
          oficializado: flags.oficializado,
          batizado: true,
          telefone: aluno.telefone || '',
          observacao: aluno.observacoes || '',
          apenasGem: nivel === 'CANDIDATO(A)',
          alunoGemRef: aluno
        });
      }
    });

    return merged;
  }, [integrantes, alunosGem]);

  // Lista única de instrumentos para o filtro seletivo
  const instrumentosUnicos = useMemo(() => {
    const list = ['Todos', ...new Set(listaConsolidada.map(i => i.instrumento).filter(Boolean))];
    return list.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [listaConsolidada]);

  const totalMusicos = listaConsolidada.filter(i => i.categoria === 'Músico').length;
  const totalOrganistas = listaConsolidada.filter(i => i.categoria === 'Organista').length;
  const totalGem = listaConsolidada.filter(i => !!i.alunoGemRef || !!i.gemId).length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
    );
  };

  // Ordem prioritária oficial da Orquestra CCB (conforme Apostila MOO e Planilha)
  const ORDEM_INSTRUMENTOS = {
    // CORDAS
    'violino': 1,
    'viola': 2,
    'violoncelo': 3,
    // MADEIRAS
    'flauta': 10,
    'flauta transversal': 10,
    'oboé': 11,
    "oboé d'amore": 12,
    'corne inglês': 13,
    'fagote': 14,
    'clarinete': 15,
    'clarinete(a)': 15,
    'clarinete alto': 16,
    'clarinete baixo': 17,
    'clarone': 17,
    'saxofone soprano': 18,
    'sax soprano': 18,
    'saxofone alto': 19,
    'sax alto': 19,
    'saxofone tenor': 20,
    'sax tenor': 20,
    'saxofone barítono': 21,
    'sax barítono': 21,
    // METAIS
    'trompete': 30,
    'cornet': 31,
    'flugelhorn': 32,
    'trompa': 33,
    'trombone': 34,
    'trombone de vara': 34,
    'trombone de pisto': 34,
    'trombonito': 35,
    'eufônio': 36,
    'eufonio': 36,
    'bombardino': 36,
    'barítono': 37,
    'barítono sib': 37,
    'tuba': 38,
    'sousafone': 38,
    // TECLAS
    'órgão': 50,
    'órgão eletrônico': 50,
    'organistas': 50
  };

  const getOrdemInstrumento = (inst) => {
    if (!inst) return 99;
    const clean = inst.toLowerCase().trim();
    if (ORDEM_INSTRUMENTOS[clean]) return ORDEM_INSTRUMENTOS[clean];
    for (const [key, val] of Object.entries(ORDEM_INSTRUMENTOS)) {
      if (clean.includes(key)) return val;
    }
    return 99;
  };

  // Filtragem e ordenação
  const filteredAndSorted = useMemo(() => {
    let result = [...listaConsolidada];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        (item.nome || '').toLowerCase().includes(q) ||
        (item.instrumento || '').toLowerCase().includes(q) ||
        (item.naipe || '').toLowerCase().includes(q) ||
        (item.nivel || '').toLowerCase().includes(q) ||
        (item.telefone || '').includes(q)
      );
    }

    if (activeNaipeFilter && activeNaipeFilter !== 'Todos') {
      result = result.filter(item => item.naipe === activeNaipeFilter);
    }

    if (filtroCategoria === 'Músico') {
      result = result.filter(item => item.categoria === 'Músico');
    } else if (filtroCategoria === 'Organista') {
      result = result.filter(item => item.categoria === 'Organista');
    } else if (filtroCategoria === 'GEM') {
      result = result.filter(item => !!item.alunoGemRef || !!item.gemId || !item.oficializado);
    }

    if (filtroOficializado === 'Oficializado') {
      result = result.filter(item => item.oficializado);
    } else if (filtroOficializado === 'NaoOficializado') {
      result = result.filter(item => !item.oficializado);
    } else if (filtroOficializado === 'RJM') {
      result = result.filter(item => item.rjm || (item.nivel && item.nivel.includes('RJM')));
    }

    if (filtrosNivel.length > 0) {
      result = result.filter(item => {
        const nivelItem = item.nivel || nivelFromFlags(item);
        return filtrosNivel.includes(nivelItem);
      });
    }

    if (filtroInstrumento && filtroInstrumento !== 'Todos') {
      result = result.filter(item => item.instrumento === filtroInstrumento);
    }

    result.sort((a, b) => {
      if (sortField === 'instrumento' || sortField === 'nome') {
        if (sortField === 'instrumento') {
          const ordA = getOrdemInstrumento(a.instrumento);
          const ordB = getOrdemInstrumento(b.instrumento);
          if (ordA !== ordB) {
            return sortDirection === 'asc' ? ordA - ordB : ordB - ordA;
          }
          const nomeA = (a.nome || '').toLowerCase();
          const nomeB = (b.nome || '').toLowerCase();
          return nomeA.localeCompare(nomeB, 'pt-BR');
        } else {
          const ordA = getOrdemInstrumento(a.instrumento);
          const ordB = getOrdemInstrumento(b.instrumento);
          if (ordA !== ordB) {
            return ordA - ordB;
          }
          const nomeA = (a.nome || '').toLowerCase();
          const nomeB = (b.nome || '').toLowerCase();
          return sortDirection === 'asc' ? nomeA.localeCompare(nomeB, 'pt-BR') : nomeB.localeCompare(nomeA, 'pt-BR');
        }
      }

      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'boolean') valA = valA ? 1 : 0;
      if (typeof valB === 'boolean') valB = valB ? 1 : 0;

      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();

      const cmp = valA.localeCompare ? valA.localeCompare(valB, 'pt-BR') : (valA > valB ? 1 : -1);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [listaConsolidada, searchTerm, activeNaipeFilter, filtroCategoria, filtroOficializado, filtrosNivel, filtroInstrumento, sortField, sortDirection]);

  const temFiltroAtivo = Boolean(
    searchTerm || 
    (activeNaipeFilter && activeNaipeFilter !== 'Todos') || 
    filtroCategoria !== 'Todos' || 
    filtroOficializado !== 'Todos' || 
    filtrosNivel.length > 0 || 
    filtroInstrumento !== 'Todos'
  );

  const limparFiltros = () => {
    setSearchTerm('');
    if (onSelectNaipe) onSelectNaipe('Todos');
    setFiltroCategoria('Todos');
    setFiltroOficializado('Todos');
    setFiltrosNivel([]);
    setFiltroInstrumento('Todos');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* BARRA SUPERIOR DE FILTROS E BUSCA */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-b from-slate-50/50 to-white space-y-3.5">
        
        {/* Linha 1: Identificação de Congregação + Busca + Botão Adicionar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Vila Rui Barbosa</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Corpo Musical e Candidatos da Casa
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-1 max-w-lg md:ml-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, instrumento, telefone..."
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!readOnly && onAddClick && (
              <button
                onClick={onAddClick}
                className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">+ Novo Integrante</span>
                <span className="sm:hidden">+ Novo</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Segmented Control de Categorias e Dropdowns de Filtro */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Segmented Control */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => {
                setFiltroCategoria('Todos');
                onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Todos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
                {listaConsolidada.length}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('Músico');
                if (activeNaipeFilter === 'Teclas / Organistas') onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Músico'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎺 Músicos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'Músico' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalMusicos}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('Organista');
                onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Organista'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎹 Organistas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'Organista' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalOrganistas}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('GEM');
                onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'GEM'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓 Ficha GEM</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'GEM' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalGem}
              </span>
            </button>
          </div>

          {/* Filtros Dropdown alinhados à direita */}
          <div className="flex flex-wrap items-center gap-2">
            {filtroCategoria !== 'Organista' && (
              <select
                value={activeNaipeFilter}
                onChange={e => onSelectNaipe(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
              >
                <option value="Todos">Todos os Naipes</option>
                <option value="Cordas">🎻 Cordas</option>
                <option value="Madeiras">🪵 Madeiras</option>
                <option value="Metais">🎺 Metais</option>
              </select>
            )}

            {/* Nível Múltipla Escolha */}
            <div className="relative" ref={nivelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNivelDropdownOpen(prev => !prev)}
                className={`text-xs px-3 py-1.5 border rounded-lg font-semibold outline-none cursor-pointer flex items-center gap-1.5 transition ${
                  filtrosNivel.length > 0
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs font-bold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                }`}
              >
                <span>
                  {filtrosNivel.length === 0
                    ? 'Níveis: Todos'
                    : filtrosNivel.length === 1
                    ? filtrosNivel[0]
                    : `${filtrosNivel.length} níveis`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isNivelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isNivelDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-fadeIn">
                  <div className="px-3 pb-1.5 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">Filtrar Nível</span>
                    {filtrosNivel.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFiltrosNivel([])}
                        className="text-red-600 hover:underline font-bold"
                      >
                        Limpar ({filtrosNivel.length})
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {NIVEIS_MUSICAL.map(nivel => {
                      const isChecked = filtrosNivel.includes(nivel);
                      const qtd = listaConsolidada.filter(i => (i.nivel || nivelFromFlags(i)) === nivel).length;
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

            {/* Instrumento Select */}
            <select
              value={filtroInstrumento}
              onChange={e => setFiltroInstrumento(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs max-w-[160px] truncate"
            >
              <option value="Todos">Todos os Instrumentos</option>
              {instrumentosUnicos.filter(i => i !== 'Todos').map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>

            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE CONTAGEM E INSTRUÇÃO */}
      <div className="bg-slate-50 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span>
          Mostrando <strong>{filteredAndSorted.length}</strong> de <strong>{listaConsolidada.length}</strong> integrantes de Vila Rui Barbosa
        </span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Clique nas colunas com setas (▲▼) para ordenar
        </span>
      </div>

      {/* VISÃO EM CARTÕES RESPONSIVA (CELULAR / TELAS PEQUENAS) */}
      <div className="md:hidden p-3 space-y-2.5 bg-slate-50/50 print:hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 p-6">
            <p className="text-slate-400 font-semibold text-sm">Nenhum integrante encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          filteredAndSorted.map(item => {
            const alunoGem = item.alunoGemRef || getAlunoGem(item);
            const rawNivel = item.nivel || nivelFromFlags(item);
            const nivelAtual = rawNivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : rawNivel;

            let nivelBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (nivelAtual === 'OFICIALIZADO') nivelBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
            else if (nivelAtual === 'RJM / OFICIALIZADO') nivelBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
            else if (nivelAtual.includes('CULTO')) nivelBadgeColor = 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
            else if (nivelAtual.includes('RJM')) nivelBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
            else if (nivelAtual === 'ENSAIO') nivelBadgeColor = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
            else if (nivelAtual === 'CANDIDATO(A)') nivelBadgeColor = 'bg-purple-50 text-purple-800 border-purple-200 font-bold';

            const corNaipeDot = 
              item.naipe === 'Cordas' ? 'bg-blue-500' :
              item.naipe === 'Madeiras' ? 'bg-emerald-500' :
              item.naipe === 'Metais' ? 'bg-amber-500' : 'bg-purple-500';

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5 hover:border-blue-200 transition"
              >
                {/* Header do Card: Instrumento + Naipe e Nível */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${corNaipeDot}`}></span>
                    {item.instrumento}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nivelBadgeColor}`}>
                    {nivelAtual}
                  </span>
                </div>

                {/* Nome do Integrante e Telefone */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.nome}</h4>
                  {item.telefone && (
                    <a 
                      href={`tel:${item.telefone}`} 
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1"
                    >
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>{item.telefone}</span>
                    </a>
                  )}
                </div>

                {/* Pílulas de Atuação nos Serviços */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
                  {item.ensaios && <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Ensaio</span>}
                  {item.rjm && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">RJM</span>}
                  {item.meiaHora && <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">Meia Hora</span>}
                  {item.cultosOficiais && <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">Cultos</span>}
                  {item.oficializado ? (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">Oficializado</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">Não Ofic.</span>
                  )}
                </div>

                {/* Rodapé com Ações */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400">CCB Rui Barbosa</span>
                  <div className="flex items-center gap-1.5">
                    {alunoGem && onOpenAlunoFicha && (
                      <button 
                        onClick={() => onOpenAlunoFicha(alunoGem)} 
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Ficha</span>
                      </button>
                    )}
                    {!readOnly && onEditClick && (
                      <button 
                        onClick={() => onEditClick(item)} 
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!readOnly && onDeleteClick && (
                      <button 
                        onClick={() => onDeleteClick(item)} 
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TABELA PRINCIPAL OTIMIZADA PARA DESKTOP E IMPRESSÃO */}
      <div className="hidden md:block print:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold sticky top-0 z-10 backdrop-blur-xs">
              <th onClick={() => handleSort('instrumento')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>Instrumento</span>
                  {getSortIcon('instrumento')}
                </div>
              </th>
              <th onClick={() => handleSort('nome')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span>Integrante</span>
                  {getSortIcon('nome')}
                </div>
              </th>
              <th onClick={() => handleSort('nivel')} className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                <div className="flex items-center justify-center gap-1.5">
                  <span>Situação / Nível</span>
                  {getSortIcon('nivel')}
                </div>
              </th>
              <th onClick={() => handleSort('ensaios')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-16" title="Toca nos Ensaios">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Ens.</span>
                  {getSortIcon('ensaios')}
                </div>
              </th>
              <th onClick={() => handleSort('rjm')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-16" title="Reunião de Jovens e Menores">
                <div className="flex items-center justify-center gap-0.5">
                  <span>RJM</span>
                  {getSortIcon('rjm')}
                </div>
              </th>
              <th onClick={() => handleSort('meiaHora')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-20" title="Toca na Meia Hora (Irmãs)">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Meia H.</span>
                  {getSortIcon('meiaHora')}
                </div>
              </th>
              <th onClick={() => handleSort('cultosOficiais')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-18" title="Cultos Oficiais">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Cultos</span>
                  {getSortIcon('cultosOficiais')}
                </div>
              </th>
              <th onClick={() => handleSort('oficializado')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-16" title="Oficializado">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Ofic.</span>
                  {getSortIcon('oficializado')}
                </div>
              </th>
              <th onClick={() => handleSort('batizado')} className="py-3 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-16" title="Batizado">
                <div className="flex items-center justify-center gap-0.5">
                  <span>Bat.</span>
                  {getSortIcon('batizado')}
                </div>
              </th>
              <th onClick={() => handleSort('telefone')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>Telefone</span>
                  {getSortIcon('telefone')}
                </div>
              </th>
              <th className="py-3 px-4 text-right whitespace-nowrap w-24">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 font-semibold">
                  Nenhum integrante encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map(item => {
                const alunoGem = item.alunoGemRef || getAlunoGem(item);
                const rawNivel = item.nivel || nivelFromFlags(item);
                const nivelAtual = rawNivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : rawNivel;

                let nivelBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                if (nivelAtual === 'OFICIALIZADO') nivelBadgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
                else if (nivelAtual === 'RJM / OFICIALIZADO') nivelBadgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
                else if (nivelAtual.includes('CULTO')) nivelBadgeStyle = 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
                else if (nivelAtual.includes('RJM')) nivelBadgeStyle = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                else if (nivelAtual === 'ENSAIO') nivelBadgeStyle = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
                else if (nivelAtual === 'CANDIDATO(A)') nivelBadgeStyle = 'bg-purple-50 text-purple-800 border-purple-200 font-bold';

                const corNaipeDot = 
                  item.naipe === 'Cordas' ? 'bg-blue-500' :
                  item.naipe === 'Madeiras' ? 'bg-emerald-500' :
                  item.naipe === 'Metais' ? 'bg-amber-500' : 'bg-purple-500';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Instrumento */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${corNaipeDot}`} />
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm block leading-tight">
                            {item.instrumento}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                            {item.naipe}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nome do Integrante */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => {
                            if (alunoGem && onOpenAlunoFicha) onOpenAlunoFicha(alunoGem);
                            else if (onEditClick) onEditClick(item);
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-blue-700 cursor-pointer transition"
                          title={alunoGem ? `Abrir ficha de ${item.nome}` : `Editar ${item.nome}`}
                        >
                          {item.nome}
                        </span>
                        {alunoGem && (
                          <button
                            onClick={() => onOpenAlunoFicha && onOpenAlunoFicha(alunoGem)}
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded transition shadow-2xs"
                            title="Ver Ficha Cadastral no GEM"
                          >
                            <BookOpen className="w-2.5 h-2.5 text-purple-600" />
                            <span>Ficha GEM</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Situação / Nível */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full border ${nivelBadgeStyle}`}>
                        {nivelAtual}
                      </span>
                    </td>

                    {/* Ensaios */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.ensaios ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-black text-xs border border-blue-200/70">
                          S
                        </span>
                      ) : (
                        <span className="text-slate-300 font-light">—</span>
                      )}
                    </td>

                    {/* RJM */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.rjm ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200/70">
                          S
                        </span>
                      ) : (
                        <span className="text-slate-300 font-light">—</span>
                      )}
                    </td>

                    {/* Meia Hora */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.meiaHora ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-50 text-purple-700 font-black text-xs border border-purple-200/70">
                          S
                        </span>
                      ) : (
                        <span className="text-slate-300 font-light">—</span>
                      )}
                    </td>

                    {/* Cultos Oficiais */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.cultosOficiais ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-teal-50 text-teal-700 font-black text-xs border border-teal-200/70">
                          S
                        </span>
                      ) : (
                        <span className="text-slate-300 font-light">—</span>
                      )}
                    </td>

                    {/* Oficializado */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.oficializado ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs shadow-2xs">
                          S
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200">
                          N
                        </span>
                      )}
                    </td>

                    {/* Batizado */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {item.batizado ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                          S
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                          N
                        </span>
                      )}
                    </td>

                    {/* Telefone */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.telefone ? (
                        <a
                          href={`tel:${item.telefone}`}
                          className="font-semibold text-slate-700 hover:text-blue-600 text-xs flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.telefone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 font-light">—</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {alunoGem && onOpenAlunoLancamento && (
                          <button
                            onClick={() => onOpenAlunoLancamento(alunoGem)}
                            title="Lançar Lição ou Histórico no GEM"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-700 transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!readOnly && onEditClick && (
                          <button
                            onClick={() => onEditClick(item)}
                            title="Editar"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!readOnly && onDeleteClick && (
                          <button
                            onClick={() => onDeleteClick(item)}
                            title="Excluir"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
