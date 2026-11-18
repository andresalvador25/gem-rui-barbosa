import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Phone, 
  CheckCircle, 
  FileSpreadsheet, 
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Music2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

// Ordem Canônica de Instrumentos da Orquestra CCB (MOO)
const ordemOrquestraMOO = {
  // Cordas
  'violino': 10,
  'viola': 20,
  'violoncelo': 30,
  // Madeiras
  'flauta transversal': 40,
  'flauta': 40,
  'oboé': 50,
  'oboe': 50,
  'oboé d\'amore': 60,
  'oboe d\'amore': 60,
  'corne inglês': 70,
  'corne ingles': 70,
  'fagote': 80,
  'clarinete': 90,
  'clarinete alto': 100,
  'clarinete baixo': 110,
  'saxofone soprano': 120,
  'sax soprano': 120,
  'saxofone alto': 130,
  'sax alto': 130,
  'saxofone tenor': 140,
  'sax tenor': 140,
  'saxofone barítono': 150,
  'sax baritono': 150,
  // Metais
  'trompete': 160,
  'cornet': 170,
  'flugelhorn': 180,
  'trompa': 190,
  'trompa - flugelhorn': 190,
  'trombone': 200,
  'trombonito': 210,
  'trombone - trombonito': 200,
  'eufônio': 220,
  'eufonio': 220,
  'barítono': 230,
  'baritono': 230,
  'eufônio - barítono': 220,
  'tuba': 240
};

// Ordem de fases para desempate
const ordemFase = {
  'Oficializado': 1,
  'Culto Oficial': 2,
  'Reunião de Jovens e Menores': 3,
  'Ensaio Local': 4,
  'GEM com Instrumento': 5
};

// TODOS OS 24 INSTRUMENTOS OFICIAIS PREVISTOS PELO MOO
const todosInstrumentosMOO = [
  // Cordas (3)
  { nome: 'Violino', naipe: 'Cordas', voz: 'Soprano e Contralto', clave: 'Clave de Sol' },
  { nome: 'Viola', naipe: 'Cordas', voz: 'Tenor', clave: 'Clave de Dó (3ª linha)' },
  { nome: 'Violoncelo', naipe: 'Cordas', voz: 'Baixo', clave: 'Clave de Fá' },
  // Madeiras (12)
  { nome: 'Flauta Transversal', naipe: 'Madeiras', voz: 'Soprano (8ª acima)', clave: 'Clave de Sol' },
  { nome: 'Oboé', naipe: 'Madeiras', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Oboé D\'Amore', naipe: 'Madeiras', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Corne Inglês', naipe: 'Madeiras', voz: 'Contralto', clave: 'Clave de Sol' },
  { nome: 'Fagote', naipe: 'Madeiras', voz: 'Baixo', clave: 'Clave de Fá' },
  { nome: 'Clarinete', naipe: 'Madeiras', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Clarinete Alto', naipe: 'Madeiras', voz: 'Tenor', clave: 'Clave de Sol' },
  { nome: 'Clarinete Baixo', naipe: 'Madeiras', voz: 'Baixo', clave: 'Clave de Sol / Fá' },
  { nome: 'Saxofone Soprano', naipe: 'Madeiras', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Saxofone Alto', naipe: 'Madeiras', voz: 'Contralto', clave: 'Clave de Sol' },
  { nome: 'Saxofone Tenor', naipe: 'Madeiras', voz: 'Tenor', clave: 'Clave de Sol' },
  { nome: 'Saxofone Barítono', naipe: 'Madeiras', voz: 'Baixo', clave: 'Clave de Sol' },
  // Metais (9)
  { nome: 'Trompete', naipe: 'Metais', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Cornet', naipe: 'Metais', voz: 'Soprano', clave: 'Clave de Sol' },
  { nome: 'Flugelhorn', naipe: 'Metais', voz: 'Contralto', clave: 'Clave de Sol' },
  { nome: 'Trompa', naipe: 'Metais', voz: 'Contralto', clave: 'Clave de Sol / Fá' },
  { nome: 'Trombone', naipe: 'Metais', voz: 'Tenor', clave: 'Clave de Dó / Fá' },
  { nome: 'Trombonito', naipe: 'Metais', voz: 'Tenor', clave: 'Clave de Sol' },
  { nome: 'Eufônio', naipe: 'Metais', voz: 'Baixo', clave: 'Clave de Fá / Sol' },
  { nome: 'Barítono', naipe: 'Metais', voz: 'Baixo', clave: 'Clave de Sol / Fá' },
  { nome: 'Tuba', naipe: 'Metais', voz: 'Baixo (8ª abaixo)', clave: 'Clave de Fá' }
];

export default function MusicosView({ musicos, onSaveMusico, onDeleteMusico }) {
  const [busca, setBusca] = useState('');
  const [filtroNaipe, setFiltroNaipe] = useState('Todos');
  const [filtroFase, setFiltroFase] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMusico, setEditMusico] = useState(null);
  const [abaVisualizacao, setAbaVisualizacao] = useState('lista'); // 'lista' ou 'quadro'

  // Sorting state - padrão prioritário: Ordem da Orquestra (MOO)
  const [sortField, setSortField] = useState('ordemOrquestra');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition shrink-0" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />;
  };

  // Form State
  const initialForm = {
    nome: '',
    instrumento: 'Violino',
    naipe: 'Cordas',
    fase: 'Oficializado',
    rjm: false,
    culto: true,
    meiaHora: false,
    oficializado: true,
    batizado: true,
    telefone: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fasesOptions = [
    'Oficializado',
    'Culto Oficial',
    'Reunião de Jovens e Menores',
    'Ensaio Local',
    'GEM com Instrumento'
  ];

  const handleOpenModal = (m = null, instrumentoPredefinido = null, naipePredefinido = null) => {
    if (m) {
      setEditMusico(m);
      setFormData({ ...m });
    } else {
      setEditMusico(null);
      setFormData({
        ...initialForm,
        instrumento: instrumentoPredefinido || initialForm.instrumento,
        naipe: naipePredefinido || (todosInstrumentosMOO.find(i => i.nome === instrumentoPredefinido)?.naipe || initialForm.naipe)
      });
    }
    setModalOpen(true);
  };

  const handleInstrumentChange = (e) => {
    const instName = e.target.value;
    const match = todosInstrumentosMOO.find(i => i.nome === instName);
    setFormData({
      ...formData,
      instrumento: instName,
      naipe: match ? match.naipe : formData.naipe
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    onSaveMusico({
      ...formData,
      id: editMusico ? editMusico.id : undefined
    });
    setModalOpen(false);
  };

  const filteredMusicos = useMemo(() => {
    const list = musicos.filter(m => {
      const matchBusca = 
        (m.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (m.instrumento || '').toLowerCase().includes(busca.toLowerCase()) ||
        (m.telefone || '').includes(busca);
      
      const matchNaipe = filtroNaipe === 'Todos' || m.naipe === filtroNaipe;
      const matchFase = filtroFase === 'Todos' || m.fase === filtroFase;

      return matchBusca && matchNaipe && matchFase;
    });

    if (sortField === 'ordemOrquestra') {
      list.sort((a, b) => {
        const instA = (a.instrumento || '').toLowerCase().trim();
        const instB = (b.instrumento || '').toLowerCase().trim();
        const scoreA = ordemOrquestraMOO[instA] || 999;
        const scoreB = ordemOrquestraMOO[instB] || 999;

        if (scoreA !== scoreB) {
          return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        }

        // Desempate por fase oficial
        const faseA = ordemFase[a.fase] || 99;
        const faseB = ordemFase[b.fase] || 99;
        if (faseA !== faseB) {
          return faseA - faseB;
        }

        // Desempate por nome
        return (a.nome || '').localeCompare(b.nome || '');
      });
    } else if (sortField) {
      list.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (typeof valA === 'boolean') {
          valA = valA ? 1 : 0;
          valB = valB ? 1 : 0;
        }
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [musicos, busca, filtroNaipe, filtroFase, sortField, sortDirection]);

  // CSV Export
  const exportCsv = () => {
    const headers = ['ID', 'Nome', 'Instrumento', 'Naipe', 'Fase', 'RJM', 'Culto Oficial', 'Oficializado', 'Batizado', 'Telefone'];
    const rows = filteredMusicos.map(m => [
      m.id,
      `"${m.nome}"`,
      `"${m.instrumento}"`,
      `"${m.naipe}"`,
      `"${m.fase}"`,
      m.rjm ? 'Sim' : 'Não',
      m.culto ? 'Sim' : 'Não',
      m.oficializado ? 'Sim' : 'Não',
      m.batizado ? 'Sim' : 'Não',
      `"${m.telefone || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `corpo_musical_rui_barbosa.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Header and Quick Stats */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Corpo Musical — Cadastro de Músicos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão individualizada dos músicos, instrumentos, fases de estudo e permissões para cultos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Músico</span>
          </button>
        </div>
      </div>

      {/* Visualização Sub-tabs (Lista vs Quadro dos 24 Instrumentos) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAbaVisualizacao('lista')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            abaVisualizacao === 'lista'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Lista Geral de Músicos ({filteredMusicos.length})</span>
        </button>

        <button
          onClick={() => setAbaVisualizacao('quadro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            abaVisualizacao === 'quadro'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>Quadro Oficial de Todos os 24 Instrumentos MOO</span>
        </button>
      </div>

      {/* MODO 1: LISTA GERAL DE MÚSICOS */}
      {abaVisualizacao === 'lista' && (
        <>
          {/* Filters and Search Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, instrumento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Filter selects and MOO priority button */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtros:</span>
              </div>

              <select
                value={filtroNaipe}
                onChange={(e) => setFiltroNaipe(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Naipes</option>
                <option value="Cordas">Cordas</option>
                <option value="Madeiras">Madeiras</option>
                <option value="Metais">Metais</option>
              </select>

              <select
                value={filtroFase}
                onChange={(e) => setFiltroFase(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="Todos">Todas as Fases</option>
                {fasesOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSortField('ordemOrquestra');
                  setSortDirection('asc');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  sortField === 'ordemOrquestra'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
                title="Ordenar prioritariamente pela ordem oficial da orquestra (Cordas, Madeiras e Metais)"
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Ordem da Orquestra (MOO)</span>
                {sortField === 'ordemOrquestra' && <span className="text-[10px] bg-blue-700 text-blue-100 px-1.5 py-0.2 rounded font-black">Ativo</span>}
              </button>

              <span className="text-xs text-slate-400 font-bold ml-2">
                ({filteredMusicos.length} exibidos)
              </span>
            </div>

          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th 
                      onClick={() => handleSort('id')}
                      className="py-3 px-4 w-12 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por número"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>#</span>
                        {renderSortIcon('id')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('nome')}
                      className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Nome"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nome do Músico</span>
                        {renderSortIcon('nome')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('instrumento')}
                      className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Instrumento"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Instrumento</span>
                        {renderSortIcon('instrumento')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('naipe')}
                      className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Naipe"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Naipe</span>
                        {renderSortIcon('naipe')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('fase')}
                      className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Fase"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Fase / Nível</span>
                        {renderSortIcon('fase')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('rjm')}
                      className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por RJM"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>RJM</span>
                        {renderSortIcon('rjm')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('culto')}
                      className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Culto"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Culto</span>
                        {renderSortIcon('culto')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('oficializado')}
                      className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Oficializado"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Oficializado</span>
                        {renderSortIcon('oficializado')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('telefone')}
                      className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                      title="Ordenar por Telefone"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Telefone</span>
                        {renderSortIcon('telefone')}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMusicos.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-slate-400">
                        Nenhum músico encontrado para os critérios de busca.
                      </td>
                    </tr>
                  ) : (
                    filteredMusicos.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{m.nome}</span>
                            {m.sam && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-300" title="Registro confirmado no SAM Web">
                                SAM OK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{m.instrumento}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.naipe === 'Cordas' ? 'bg-blue-100 text-blue-800' :
                            m.naipe === 'Madeiras' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {m.naipe}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.fase === 'Oficializado' ? 'bg-emerald-100 text-emerald-800' :
                            m.fase === 'Culto Oficial' ? 'bg-blue-100 text-blue-800' :
                            m.fase === 'Reunião de Jovens e Menores' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {m.fase}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {m.rjm ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {m.culto ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {m.oficializado ? (
                            <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                              SIM
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">NÃO</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {m.telefone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {m.telefone}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenModal(m)}
                              title="Editar músico"
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja realmente remover ${m.nome}?`)) {
                                  onDeleteMusico(m.id);
                                }
                              }}
                              title="Remover músico"
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODO 2: QUADRO OFICIAL DE TODOS OS 24 INSTRUMENTOS DO MOO */}
      {abaVisualizacao === 'quadro' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-xs text-blue-900">Catálogo dos 24 Instrumentos Permitidos pelo MOO</h3>
                <p className="text-[11px] text-blue-700">Mesmo os instrumentos que ainda não têm músicos cadastrados nesta localidade estão visíveis para acompanhamento e novas inscrições.</p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-blue-600 text-white px-3 py-1 rounded-lg">
              24 Instrumentos Oficiais
            </span>
          </div>

          {['Cordas', 'Madeiras', 'Metais'].map(naipeNome => {
            const instrumentosNaipe = todosInstrumentosMOO.filter(i => i.naipe === naipeNome);

            return (
              <div key={naipeNome} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      naipeNome === 'Cordas' ? 'bg-blue-600' :
                      naipeNome === 'Madeiras' ? 'bg-amber-500' : 'bg-rose-600'
                    }`}></span>
                    <span>Família das {naipeNome}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    {instrumentosNaipe.length} instrumentos catalogados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {instrumentosNaipe.map(inst => {
                    const musicosDoInstrumento = musicos.filter(m => {
                      const mNome = (m.instrumento || '').toLowerCase().trim();
                      const iNome = inst.nome.toLowerCase().trim();
                      return mNome.includes(iNome.split(' ')[0]);
                    });

                    const temMusicos = musicosDoInstrumento.length > 0;

                    return (
                      <div 
                        key={inst.nome}
                        className={`rounded-xl p-4 border transition flex flex-col justify-between ${
                          temMusicos 
                            ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm' 
                            : 'bg-amber-50/30 border-dashed border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {inst.voz}
                              </span>
                              <h4 className="font-black text-sm text-slate-900 leading-snug">
                                {inst.nome}
                              </h4>
                              <span className="text-[10px] text-slate-500 block">
                                {inst.clave}
                              </span>
                            </div>

                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                              temMusicos 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {musicosDoInstrumento.length} {musicosDoInstrumento.length === 1 ? 'músico' : 'músicos'}
                            </span>
                          </div>

                          {/* Lista de músicos deste instrumento */}
                          <div className="mt-3 space-y-1 max-h-28 overflow-y-auto">
                            {temMusicos ? (
                              musicosDoInstrumento.map(m => (
                                <div key={m.id} className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center justify-between">
                                  <span className="truncate">{m.nome}</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                                    {m.fase}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 bg-amber-50 rounded border border-amber-200 text-center">
                                <span className="text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Nenhum músico cadastrado
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botão para cadastrar músico diretamente neste instrumento */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleOpenModal(null, inst.nome, inst.naipe)}
                            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Cadastrar Músico</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar / Editar Músico */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editMusico ? 'Editar Músico' : 'Novo Músico'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instrumento</label>
                  <select
                    value={formData.instrumento}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 cursor-pointer font-semibold"
                  >
                    {todosInstrumentosMOO.map(i => (
                      <option key={i.nome} value={i.nome}>{i.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Naipe</label>
                  <input
                    type="text"
                    disabled
                    value={formData.naipe}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-600 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fase / Nível</label>
                <select
                  value={formData.fase}
                  onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 cursor-pointer font-semibold"
                >
                  {fasesOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              {/* Permissões e Checkboxes */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.culto}
                    onChange={(e) => setFormData({ ...formData, culto: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Toca Culto Oficial</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rjm}
                    onChange={(e) => setFormData({ ...formData, rjm: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Toca na RJM</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.oficializado}
                    onChange={(e) => setFormData({ ...formData, oficializado: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Oficializado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.batizado}
                    onChange={(e) => setFormData({ ...formData, batizado: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Batizado</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
