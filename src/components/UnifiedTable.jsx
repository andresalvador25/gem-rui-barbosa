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
  ChevronDown
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
  const [filtrosNivel, setFiltrosNivel] = useState([]); // Array de níveis selecionados (múltipla escolha)
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

  // Suporte a filtro inicial vindo de Relação Analítica
  React.useEffect(() => {
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

  const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  // Helper seguro para localizar o aluno correspondente no GEM
  const getAlunoGem = (itemOrNome) => {
    if (!itemOrNome || !alunosGem || alunosGem.length === 0) return null;
    const target = typeof itemOrNome === 'string' ? { nome: itemOrNome } : itemOrNome;
    return alunosGem.find(a => isSamePerson(target, a)) || null;
  };

  // Lista consolidada e linkada em tempo real (Orquestra + GEM sincronizados)
  const listaConsolidada = useMemo(() => {
    const usedGemIds = new Set();
    const merged = integrantes.map(intg => {
      const aluno = alunosGem.find(a => isSamePerson(intg, a));
      if (aluno) usedGemIds.add(aluno.id);
      return {
        ...mergeIntegranteWithGem(intg, aluno),
        alunoGemRef: aluno || null
      };
    });

    // Inclui também os candidatos do GEM que ainda estão apenas como CANDIDATO(A)
    alunosGem.forEach(aluno => {
      if (!usedGemIds.has(aluno.id)) {
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

  // Lista única de instrumentos presentes para o filtro rápido
  const instrumentosUnicos = useMemo(() => {
    const list = ['Todos', ...new Set(listaConsolidada.map(i => i.instrumento).filter(Boolean))];
    return list.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [listaConsolidada]);

  const totalMusicos = listaConsolidada.filter(i => i.categoria === 'Músico').length;
  const totalOrganistas = listaConsolidada.filter(i => i.categoria === 'Organista').length;

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
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  // Ordem prioritária exata da Orquestra CCB (conforme Apostila MOO e Planilha)
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

    // Filtro por Categoria: Músico, Organista ou Alunos GEM
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
      // Se a coluna clicada for 'instrumento', ou por padrão:
      // Ordena primeiro pela Ordem Oficial da Orquestra e depois pelo Nome alfabético
      if (sortField === 'instrumento' || sortField === 'nome') {
        if (sortField === 'instrumento') {
          const ordA = getOrdemInstrumento(a.instrumento);
          const ordB = getOrdemInstrumento(b.instrumento);
          if (ordA !== ordB) {
            return sortDirection === 'asc' ? ordA - ordB : ordB - ordA;
          }
          // Empate no mesmo instrumento: desempatar por ordem alfabética do nome
          const nomeA = (a.nome || '').toLowerCase();
          const nomeB = (b.nome || '').toLowerCase();
          return nomeA.localeCompare(nomeB, 'pt-BR');
        } else {
          // Se clicou em ordenar por Nome:
          // Primeiro por instrumento, depois por nome, OU direto por nome:
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, instrumento, telefone..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!readOnly && onAddClick && (
            <button
              onClick={onAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Novo Integrante</span>
            </button>
          )}
        </div>

        {/* Filtros em Pílulas */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Novo Filtro: Músicos vs Organistas */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setFiltroCategoria('Todos');
                onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                filtroCategoria === 'Todos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({listaConsolidada.length})
            </button>
            <button
              onClick={() => {
                setFiltroCategoria('Músico');
                if (activeNaipeFilter === 'Teclas / Organistas') onSelectNaipe('Todos');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filtroCategoria === 'Músico'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎺 Apenas Músicos</span>
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
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filtroCategoria === 'Organista'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎹 Apenas Organistas</span>
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
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filtroCategoria === 'GEM'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓 Ficha / Alunos GEM</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filtroCategoria === 'GEM' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {alunosGem.length}
              </span>
            </button>
          </div>

          <span className="text-slate-300 mx-1">|</span>

          {/* Filtro por Naipes (visível se não estiver restrito a Organistas) */}
          {filtroCategoria !== 'Organista' && (
            <>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Naipes:
              </span>

              {[
                { id: 'Todos', label: 'Todos' },
                { id: 'Cordas', label: '🎻 Cordas' },
                { id: 'Madeiras', label: '🪵 Madeiras' },
                { id: 'Metais', label: '🎺 Metais' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectNaipe(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    activeNaipeFilter === p.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <span className="text-slate-300 mx-1">|</span>
            </>
          )}

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

          {/* Filtro por Instrumento Específico */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instrumento:
            </span>
            <select
              value={filtroInstrumento}
              onChange={e => setFiltroInstrumento(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Instrumentos</option>
              {instrumentosUnicos.filter(i => i !== 'Todos').map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {(searchTerm || activeNaipeFilter !== 'Todos' || filtroCategoria !== 'Todos' || filtroOficializado !== 'Todos' || filtrosNivel.length > 0 || filtroInstrumento !== 'Todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                if (onSelectNaipe) onSelectNaipe('Todos');
                setFiltroCategoria('Todos');
                setFiltroOficializado('Todos');
                setFiltrosNivel([]);
                setFiltroInstrumento('Todos');
              }}
              className="text-xs text-red-600 hover:underline font-semibold ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Contagem */}
      <div className="bg-slate-50/80 px-4 sm:px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span>
          Mostrando <strong>{filteredAndSorted.length}</strong> de <strong>{listaConsolidada.length}</strong> integrantes e candidatos
        </span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Clique nos cabeçalhos com setas (▲▼) para ordenar qualquer coluna
        </span>
      </div>

      {/* VISÃO EM CARTÕES OTIMIZADA PARA CELULAR (md:hidden) */}
      <div className="md:hidden divide-y divide-slate-100 print:hidden">
        {filteredAndSorted.map(item => {
          const alunoGem = item.alunoGemRef || getAlunoGem(item);
          const rawNivel = item.nivel || nivelFromFlags(item);
          const nivelAtual = rawNivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : rawNivel;

          let nivelBadgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
          if (nivelAtual === 'OFICIALIZADO') nivelBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
          else if (nivelAtual === 'RJM / OFICIALIZADO') nivelBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-300';
          else if (nivelAtual.includes('CULTO')) nivelBadgeColor = 'bg-teal-50 text-teal-800 border-teal-300';
          else if (nivelAtual.includes('RJM')) nivelBadgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
          else if (nivelAtual === 'ENSAIO') nivelBadgeColor = 'bg-blue-50 text-blue-800 border-blue-300';
          else if (nivelAtual === 'CANDIDATO(A)') nivelBadgeColor = 'bg-purple-50 text-purple-800 border-purple-300';

          return (
            <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/80 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-slate-900 text-sm leading-snug">
                      {item.nome}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nivelBadgeColor}`}>
                      {nivelAtual}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-bold">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.naipe === 'Cordas'
                          ? 'bg-blue-500'
                          : item.naipe === 'Madeiras'
                          ? 'bg-emerald-500'
                          : item.naipe === 'Metais'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                    />
                    <span>{item.instrumento}</span>
                    {item.telefone && (
                      <a
                        href={`tel:${item.telefone}`}
                        className="text-blue-600 font-semibold flex items-center gap-1 ml-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{item.telefone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Pílulas de Atuação + Ações rápidas para Toque no Celular */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1">
                  {item.ensaios && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                      Ensaio
                    </span>
                  )}
                  {item.rjm && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                      RJM
                    </span>
                  )}
                  {item.meiaHora && (
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                      Meia Hora
                    </span>
                  )}
                  {item.cultosOficiais && (
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                      Cultos
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {alunoGem && onOpenAlunoFicha && (
                    <button
                      onClick={() => onOpenAlunoFicha(alunoGem)}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-100 text-purple-800 font-extrabold text-[11px] flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Ficha</span>
                    </button>
                  )}
                  {!readOnly && onEditClick && (
                    <button
                      onClick={() => onEditClick(item)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!readOnly && onDeleteClick && (
                    <button
                      onClick={() => onDeleteClick(item)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela com as Colunas Exatas da Planilha (Desktop e Impressão) */}
      <div className="hidden md:block print:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-bold">
              {/* Instrumento */}
              <th
                onClick={() => handleSort('instrumento')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Instrumento</span>
                  {getSortIcon('instrumento')}
                </div>
              </th>

              {/* Nome */}
              <th
                onClick={() => handleSort('nome')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition group select-none min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>Nome</span>
                  {getSortIcon('nome')}
                </div>
              </th>

              {/* Ensaios */}
              <th
                onClick={() => handleSort('ensaios')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
                title="Toca nos Ensaios"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Ensaios</span>
                  {getSortIcon('ensaios')}
                </div>
              </th>

              {/* RJM (Somente Não casados) */}
              <th
                onClick={() => handleSort('rjm')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
                title="RJM (Somente Não casados)"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>RJM</span>
                  {getSortIcon('rjm')}
                </div>
              </th>

              {/* Meia Hora (Para irmãs somente) */}
              <th
                onClick={() => handleSort('meiaHora')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
                title="Meia Hora (Para irmãs somente)"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Meia Hora</span>
                  {getSortIcon('meiaHora')}
                </div>
              </th>

              {/* Cultos Oficiais */}
              <th
                onClick={() => handleSort('cultosOficiais')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
                title="Cultos Oficiais"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Cultos Oficiais</span>
                  {getSortIcon('cultosOficiais')}
                </div>
              </th>

              {/* Oficializado (S/N) */}
              <th
                onClick={() => handleSort('oficializado')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Oficializado</span>
                  {getSortIcon('oficializado')}
                </div>
              </th>

              {/* Batizados (S/N) */}
              <th
                onClick={() => handleSort('batizado')}
                className="py-3 px-2.5 text-center cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Batizado</span>
                  {getSortIcon('batizado')}
                </div>
              </th>

              {/* Telefone */}
              <th
                onClick={() => handleSort('telefone')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition group select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Telefone</span>
                  {getSortIcon('telefone')}
                </div>
              </th>

              {/* Ações */}
              <th className="py-3 px-3 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSorted.map(item => {
              const isOrganista = item.categoria === 'Organista';
              const alunoGem = item.alunoGemRef || getAlunoGem(item);
              const rawNivel = item.nivel || nivelFromFlags(item);
              const nivelAtual = rawNivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : rawNivel;

              let nivelBadgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
              if (nivelAtual === 'OFICIALIZADO') nivelBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
              else if (nivelAtual === 'RJM / OFICIALIZADO') nivelBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-300';
              else if (nivelAtual.includes('CULTO')) nivelBadgeColor = 'bg-teal-50 text-teal-800 border-teal-300';
              else if (nivelAtual.includes('RJM')) nivelBadgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
              else if (nivelAtual === 'ENSAIO') nivelBadgeColor = 'bg-blue-50 text-blue-800 border-blue-300';
              else if (nivelAtual === 'CANDIDATO(A)') nivelBadgeColor = 'bg-purple-50 text-purple-800 border-purple-300';

              return (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  {/* Instrumento */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        item.naipe === 'Cordas' ? 'bg-blue-500' :
                        item.naipe === 'Madeiras' ? 'bg-emerald-500' :
                        item.naipe === 'Metais' ? 'bg-amber-500' : 'bg-purple-500'
                      }`}></span>
                      {item.instrumento}
                    </span>
                  </td>

                  {/* Nome */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        onClick={() => {
                          if (alunoGem && onOpenAlunoFicha) onOpenAlunoFicha(alunoGem);
                          else if (onEditClick) onEditClick(item);
                        }}
                        title={alunoGem ? `Clique para abrir os dados de ${item.nome}` : `Clique para editar ${item.nome}`}
                        className={`font-semibold text-slate-900 text-sm transition ${
                          alunoGem
                            ? 'hover:text-purple-700 hover:underline cursor-pointer'
                            : onEditClick
                            ? 'hover:text-blue-700 hover:underline cursor-pointer'
                            : ''
                        }`}
                      >
                        {item.nome}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nivelBadgeColor}`}>
                        {nivelAtual}
                      </span>
                      {alunoGem && (
                        <button
                          onClick={() => onOpenAlunoFicha && onOpenAlunoFicha(alunoGem)}
                          title={`Ver Ficha Cadastral GEM (${alunoGem.nivel})`}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 transition shadow-xs"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-purple-600" />
                          <span>Ficha GEM</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Ensaios */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.ensaios ? (
                      <span className="inline-block bg-blue-100 text-blue-800 font-bold text-xs px-2 py-0.5 rounded">
                        S
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* RJM */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.rjm ? (
                      <span className="inline-block bg-indigo-100 text-indigo-800 font-bold text-xs px-2 py-0.5 rounded">
                        S
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Meia Hora */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.meiaHora ? (
                      <span className="inline-block bg-purple-100 text-purple-800 font-bold text-xs px-2 py-0.5 rounded">
                        S
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Cultos Oficiais */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.cultosOficiais ? (
                      <span className="inline-block bg-teal-100 text-teal-800 font-bold text-xs px-2 py-0.5 rounded">
                        S
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Oficializado (S/N) */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.oficializado ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-0.5 rounded-full border border-emerald-300">
                        S
                      </span>
                    ) : (
                      <span className="inline-block bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                        N
                      </span>
                    )}
                  </td>

                  {/* Batizados (S/N) */}
                  <td className="py-2.5 px-2.5 text-center">
                    {item.batizado ? (
                      <span className="inline-block bg-slate-100 text-slate-800 font-bold text-xs px-2 py-0.5 rounded">
                        S
                      </span>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-700 font-bold text-xs px-2 py-0.5 rounded">
                        N
                      </span>
                    )}
                  </td>

                  {/* Telefone */}
                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                    {item.telefone ? (
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.telefone}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {alunoGem && onOpenAlunoLancamento && (
                        <button
                          onClick={() => onOpenAlunoLancamento(alunoGem)}
                          title="Lançar Lição ou Prova no Histórico do GEM"
                          className="p-1 rounded-lg hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!readOnly && onEditClick && (
                        <button
                          onClick={() => onEditClick(item)}
                          title="Editar"
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!readOnly && onDeleteClick && (
                        <button
                          onClick={() => onDeleteClick(item)}
                          title="Excluir"
                          className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                        >
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
    </div>
  );
}
