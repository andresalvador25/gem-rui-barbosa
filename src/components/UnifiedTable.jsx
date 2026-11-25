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
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { detectarNaipe } from '../constants/instruments.js';
import { NIVEIS_MUSICAL, isSamePerson, mergeIntegranteWithGem, formatInstrumentName, flagsFromNivel, nivelFromFlags } from '../utils/gemSync.js';

// Normaliza nomes para formato legível (Title Case elegante)
const formatNome = (str = '') => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(lower) && idx > 0) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

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
  const [filtroCategoria, setFiltroCategoria] = useState('Orquestra'); // 'Orquestra', 'Músico', 'Organista', 'GEM'
  const [filtrosNivel, setFiltrosNivel] = useState([]);
  const [isNivelDropdownOpen, setIsNivelDropdownOpen] = useState(false);
  const nivelDropdownRef = useRef(null);
  const [filtroInstrumento, setFiltroInstrumento] = useState('Todos');
  const [sortField, setSortField] = useState('instrumento');
  const [sortDirection, setSortDirection] = useState('asc');
  const [modoVisualizacao, setModoVisualizacao] = useState('moderno'); // 'moderno' ou 'planilha'

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
      setFiltrosNivel(['OFICIALIZADO', 'RJM / OFICIALIZADO']);
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'musicos_nao_ofic') {
      setFiltroCategoria('Músico');
      setFiltrosNivel(['ENSAIO', 'RJM', 'CULTO OFICIAL', 'CANDIDATO(A)']);
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'organistas_ofic') {
      setFiltroCategoria('Organista');
      setFiltrosNivel(['OFICIALIZADO', 'RJM / OFICIALIZADO']);
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'organistas_nao_ofic') {
      setFiltroCategoria('Organista');
      setFiltrosNivel(['ENSAIO', 'RJM', 'CULTO OFICIAL', 'CANDIDATO(A)']);
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'total_musicos') {
      setFiltroCategoria('Músico');
      setFiltrosNivel([]);
      if (onSelectNaipe) onSelectNaipe('Todos');
    } else if (initialFilter === 'total_organistas') {
      setFiltroCategoria('Organista');
      setFiltrosNivel([]);
      if (onSelectNaipe) onSelectNaipe('Todos');
    }
  }, [initialFilter]);

  // Helper seguro para garantir estritamente integrantes de Vila Rui Barbosa
  const isFromRuiBarbosa = (item) => {
    const comum = (item?.comum || '').toUpperCase().trim();
    if (!comum) return true;
    return comum.includes('RUI BARBOSA') || comum.includes('VRB');
  };

  const getAlunoGem = (itemOrNome) => {
    if (!itemOrNome || !alunosGem || alunosGem.length === 0) return null;
    const target = typeof itemOrNome === 'string' ? { nome: itemOrNome } : itemOrNome;
    return alunosGem.find(a => isSamePerson(target, a)) || null;
  };

  // 1. Integrantes Oficiais da Orquestra de Vila Rui Barbosa (55 integrantes)
  const integrantesOrquestra = useMemo(() => {
    return (integrantes || []).filter(isFromRuiBarbosa).map(intg => {
      const aluno = (alunosGem || []).find(a => isSamePerson(intg, a));
      return {
        ...mergeIntegranteWithGem(intg, aluno),
        nomeFormatado: formatNome(intg.nome),
        alunoGemRef: aluno || null,
        isOrquestra: true
      };
    });
  }, [integrantes, alunosGem]);

  // 2. Alunos e Candidatos do GEM de Vila Rui Barbosa que ainda NÃO estão na Orquestra
  const candidatosGemApenas = useMemo(() => {
    const existingIds = new Set(integrantesOrquestra.map(i => i.gemId || i.id));
    const list = [];
    (alunosGem || []).forEach(aluno => {
      if (!existingIds.has(aluno.id) && !integrantesOrquestra.some(i => isSamePerson(i, aluno)) && isFromRuiBarbosa(aluno)) {
        const categoria = String(aluno.cargo || '').toUpperCase() === 'ORGANISTA' ? 'Organista' : 'Músico';
        const instrumento = formatInstrumentName(aluno.instrumento, categoria);
        const naipe = detectarNaipe(instrumento, categoria);
        const nivel = String(aluno.nivel || 'CANDIDATO(A)').toUpperCase().trim();
        const flags = flagsFromNivel(nivel, false);
        list.push({
          id: `gem-${aluno.id}`,
          gemId: aluno.id,
          nome: aluno.nome,
          nomeFormatado: formatNome(aluno.nome),
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
          isOrquestra: false,
          alunoGemRef: aluno
        });
      }
    });
    return list;
  }, [integrantesOrquestra, alunosGem]);

  // Lista base conforme a categoria selecionada (Por padrão, foca na Orquestra da casa)
  const baseList = useMemo(() => {
    if (filtroCategoria === 'GEM') {
      return [...integrantesOrquestra.filter(i => !!i.alunoGemRef), ...candidatosGemApenas];
    }
    return integrantesOrquestra;
  }, [filtroCategoria, integrantesOrquestra, candidatosGemApenas]);

  // Contadores oficiais
  const totalOrquestra = integrantesOrquestra.length;
  const totalMusicos = integrantesOrquestra.filter(i => i.categoria === 'Músico').length;
  const totalOrganistas = integrantesOrquestra.filter(i => i.categoria === 'Organista').length;
  const totalGemRuiBarbosa = (alunosGem || []).filter(isFromRuiBarbosa).length;

  // Lista de instrumentos únicos para filtro
  const instrumentosUnicos = useMemo(() => {
    const list = ['Todos', ...new Set(baseList.map(i => i.instrumento).filter(Boolean))];
    return list.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [baseList]);

  // Ordem prioritária oficial da Orquestra CCB
  const ORDEM_INSTRUMENTOS = {
    'violino': 1, 'viola': 2, 'violoncelo': 3,
    'flauta': 10, 'flauta transversal': 10, 'oboé': 11, "oboé d'amore": 12, 'corne inglês': 13,
    'fagote': 14, 'clarinete': 15, 'clarinete alto': 16, 'clarinete baixo': 17, 'clarone': 17,
    'saxofone soprano': 18, 'sax soprano': 18, 'saxofone alto': 19, 'sax alto': 19,
    'saxofone tenor': 20, 'sax tenor': 20, 'saxofone barítono': 21, 'sax barítono': 21,
    'trompete': 30, 'cornet': 31, 'flugelhorn': 32, 'trompa': 33,
    'trombone': 34, 'trombone de vara': 34, 'trombone de pisto': 34, 'trombonito': 35,
    'eufônio': 36, 'eufonio': 36, 'bombardino': 36, 'barítono': 37, 'tuba': 38, 'sousafone': 38,
    'órgão': 50, 'órgão eletrônico': 50, 'organistas': 50
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

  // Filtragem e ordenação
  const filteredAndSorted = useMemo(() => {
    let result = [...baseList];

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
  }, [baseList, searchTerm, activeNaipeFilter, filtroCategoria, filtrosNivel, filtroInstrumento, sortField, sortDirection]);

  const temFiltroAtivo = Boolean(
    searchTerm || 
    (activeNaipeFilter && activeNaipeFilter !== 'Todos') || 
    filtroCategoria !== 'Orquestra' || 
    filtrosNivel.length > 0 || 
    filtroInstrumento !== 'Todos'
  );

  const limparFiltros = () => {
    setSearchTerm('');
    if (onSelectNaipe) onSelectNaipe('Todos');
    setFiltroCategoria('Orquestra');
    setFiltrosNivel([]);
    setFiltroInstrumento('Todos');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* TOOLBAR SUPERIOR COMPACTA E MODERNA */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        {/* Linha 1: Busca + Alternador de Visualização + Botão Adicionar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, instrumento, telefone..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
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

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Alternador de Layout: Visual Moderno vs Planilha CCB */}
            <div className="hidden lg:inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 text-xs font-bold">
              <button
                onClick={() => setModoVisualizacao('moderno')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  modoVisualizacao === 'moderno'
                    ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualização moderna com foco em leitura rápida"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Moderno</span>
              </button>
              <button
                onClick={() => setModoVisualizacao('planilha')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  modoVisualizacao === 'planilha'
                    ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Visualização em colunas completas da Planilha Oficial"
              >
                <TableIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Planilha CCB</span>
              </button>
            </div>

            {!readOnly && onAddClick && (
              <button
                onClick={onAddClick}
                className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Novo Integrante</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Pílulas de Categoria e Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-200/60">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/60 border border-slate-200 gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => {
                setFiltroCategoria('Orquestra');
                if (onSelectNaipe) onSelectNaipe('Todos');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Orquestra'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Orquestra</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">
                {totalOrquestra}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('Músico');
                if (activeNaipeFilter === 'Teclas / Organistas' && onSelectNaipe) onSelectNaipe('Todos');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Músico'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Músicos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'Músico' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalMusicos}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('Organista');
                if (onSelectNaipe) onSelectNaipe('Todos');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'Organista'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Organistas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'Organista' ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalOrganistas}
              </span>
            </button>

            <button
              onClick={() => {
                setFiltroCategoria('GEM');
                if (onSelectNaipe) onSelectNaipe('Todos');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filtroCategoria === 'GEM'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ver alunos e candidatos em acompanhamento no GEM"
            >
              <span>Alunos GEM</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'GEM' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalGemRuiBarbosa}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filtroCategoria !== 'Organista' && (
              <select
                value={activeNaipeFilter}
                onChange={e => onSelectNaipe && onSelectNaipe(e.target.value)}
                className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Naipes</option>
                <option value="Cordas">🎻 Cordas</option>
                <option value="Madeiras">🪵 Madeiras</option>
                <option value="Metais">🎺 Metais</option>
              </select>
            )}

            {/* Nível Dropdown */}
            <div className="relative" ref={nivelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNivelDropdownOpen(prev => !prev)}
                className={`text-xs px-2.5 py-1.5 border rounded-lg font-semibold outline-none cursor-pointer flex items-center gap-1.5 transition ${
                  filtrosNivel.length > 0
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
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
                <div className="absolute right-0 top-full mt-1.5 z-50 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-fadeIn">
                  <div className="px-3 pb-1.5 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500 uppercase">Filtrar Nível</span>
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
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {NIVEIS_MUSICAL.map(nivel => {
                      const isChecked = filtrosNivel.includes(nivel);
                      const qtd = baseList.filter(i => (i.nivel || nivelFromFlags(i)) === nivel).length;
                      return (
                        <label
                          key={nivel}
                          className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition ${
                            isChecked ? 'bg-blue-50/70 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
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

            <select
              value={filtroInstrumento}
              onChange={e => setFiltroInstrumento(e.target.value)}
              className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="Todos">Todos Instrumentos</option>
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

      {/* BARRA DE CONTAGEM INFORMATIVA */}
      <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          Mostrando <strong>{filteredAndSorted.length}</strong> {filtroCategoria === 'GEM' ? 'candidatos e alunos' : 'integrantes da orquestra'} de Vila Rui Barbosa
        </span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Clique nos títulos das colunas para ordenar
        </span>
      </div>

      {/* MODO 1: VISÃO MODERNA (ELEGANTE, LIMPA, SEM ESPAÇOS VAZIOS) */}
      {modoVisualizacao === 'moderno' && (
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold sticky top-0 z-10 backdrop-blur-xs">
                <th onClick={() => handleSort('instrumento')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <span>Instrumento</span>
                    {getSortIcon('instrumento')}
                  </div>
                </th>
                <th onClick={() => handleSort('nome')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                  <div className="flex items-center gap-1.5">
                    <span>Integrante / Nome</span>
                    {getSortIcon('nome')}
                  </div>
                </th>
                <th onClick={() => handleSort('nivel')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-[220px]">
                  <div className="flex items-center gap-1.5">
                    <span>Situação / Nível</span>
                    {getSortIcon('nivel')}
                  </div>
                </th>
                <th onClick={() => handleSort('telefone')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap w-[180px]">
                  <div className="flex items-center gap-1.5">
                    <span>Telefone</span>
                    {getSortIcon('telefone')}
                  </div>
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap w-[90px]">
                  <span>Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
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
                            <span className="font-extrabold text-slate-900 text-sm block leading-tight">
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
                            title={alunoGem ? `Abrir ficha de ${item.nomeFormatado}` : `Editar ${item.nomeFormatado}`}
                          >
                            {item.nomeFormatado}
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${nivelBadgeStyle}`}>
                            {nivelAtual}
                          </span>
                          {item.categoria === 'Organista' && item.meiaHora && (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200/80" title="Toca na Meia Hora">
                              Meia Hora
                            </span>
                          )}
                        </div>
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
                          <span className="text-slate-300 font-light text-xs">—</span>
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
      )}

      {/* MODO 2: VISÃO PLANILHA CCB (COLUNAS INDIVIDUAIS DE S/N COMPACTAS) */}
      {modoVisualizacao === 'planilha' && (
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold sticky top-0 z-10 backdrop-blur-xs">
                <th onClick={() => handleSort('instrumento')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                  <span>Instrumento</span>
                </th>
                <th onClick={() => handleSort('nome')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition min-w-[180px]">
                  <span>Integrante</span>
                </th>
                <th onClick={() => handleSort('nivel')} className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                  <span>Nível</span>
                </th>
                <th className="py-2.5 px-1.5 text-center w-12" title="Ensaios">Ens.</th>
                <th className="py-2.5 px-1.5 text-center w-12" title="Reunião de Jovens e Menores">RJM</th>
                <th className="py-2.5 px-1.5 text-center w-14" title="Meia Hora">Meia H.</th>
                <th className="py-2.5 px-1.5 text-center w-14" title="Cultos Oficiais">Cultos</th>
                <th className="py-2.5 px-1.5 text-center w-12" title="Oficializado">Ofic.</th>
                <th className="py-2.5 px-1.5 text-center w-12" title="Batizado">Bat.</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Telefone</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSorted.map(item => {
                const alunoGem = item.alunoGemRef || getAlunoGem(item);
                const rawNivel = item.nivel || nivelFromFlags(item);
                const nivelAtual = rawNivel === 'RJM OFICIALIZADO' ? 'RJM / OFIC.' : rawNivel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-800">
                      {item.instrumento}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.nomeFormatado}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {nivelAtual}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.ensaios ? <span className="font-bold text-blue-700">S</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.rjm ? <span className="font-bold text-indigo-700">S</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.meiaHora ? <span className="font-bold text-purple-700">S</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.cultosOficiais ? <span className="font-bold text-teal-700">S</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.oficializado ? <span className="font-bold text-emerald-700">S</span> : <span className="text-slate-400">N</span>}
                    </td>
                    <td className="py-2 px-1.5 text-center">
                      {item.batizado ? <span className="font-bold text-slate-700">S</span> : <span className="text-rose-700">N</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                      {item.telefone || '—'}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {!readOnly && onEditClick && (
                          <button onClick={() => onEditClick(item)} className="p-1 hover:text-blue-600">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!readOnly && onDeleteClick && (
                          <button onClick={() => onDeleteClick(item)} className="p-1 hover:text-red-600 text-slate-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VISÃO EM CARTÕES RESPONSIVA (CELULAR) */}
      <div className="md:hidden p-3 space-y-2 bg-slate-50/50 print:hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300 p-4">
            <p className="text-slate-400 font-semibold text-xs">Nenhum integrante encontrado.</p>
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
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${corNaipeDot}`}></span>
                    {item.instrumento}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nivelBadgeColor}`}>
                      {nivelAtual}
                    </span>
                    {item.categoria === 'Organista' && item.meiaHora && (
                      <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                        Meia Hora
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.nomeFormatado}</h4>
                  {item.telefone && (
                    <a 
                      href={`tel:${item.telefone}`} 
                      className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-0.5"
                    >
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>{item.telefone}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400">CCB Rui Barbosa</span>
                  <div className="flex items-center gap-1.5">
                    {alunoGem && onOpenAlunoFicha && (
                      <button 
                        onClick={() => onOpenAlunoFicha(alunoGem)} 
                        className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Ficha</span>
                      </button>
                    )}
                    {!readOnly && onEditClick && (
                      <button 
                        onClick={() => onEditClick(item)} 
                        className="p-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!readOnly && onDeleteClick && (
                      <button 
                        onClick={() => onDeleteClick(item)} 
                        className="p-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600"
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
    </div>
  );
}
