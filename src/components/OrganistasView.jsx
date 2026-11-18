import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function OrganistasView({ organistas, config, onSaveOrganista, onDeleteOrganista }) {
  const [busca, setBusca] = useState('');
  const [filtroFase, setFiltroFase] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);

  // Sorting state
  const [sortField, setSortField] = useState('nome');
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
      ? <ArrowUp className="w-3.5 h-3.5 text-purple-600 font-bold shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 text-purple-600 font-bold shrink-0" />;
  };

  const initialForm = {
    nome: '',
    fase: 'Oficializada',
    nivel: 'Oficializada',
    cultos: true,
    rjm: false,
    meiaHora: false,
    telefone: '',
    comum: 'Vila Rui Barbosa'
  };
  const [formData, setFormData] = useState(initialForm);

  const fasesOptions = [
    'Oficializada',
    'Culto Oficial',
    'Candidata'
  ];

  const niveisOptions = [
    'Oficializada',
    'Culto Oficial',
    'RJM / Meia Hora / Culto',
    'Meia Hora',
    'RJM',
    'Candidata'
  ];

  // Cálculos do Painel Oficial CCB de Organistas
  const oficializadasCount = organistas.filter(o => o.fase === 'Oficializada').length;
  const cultoOficialCount = organistas.filter(o => o.fase === 'Culto Oficial').length;
  const candidatasCount = organistas.filter(o => o.fase === 'Candidata').length;
  const aptasRjmCount = organistas.filter(o => o.rjm).length;

  const idealRjm = config?.idealOrganistasRjm || 3;
  const idealCulto = config?.idealOrganistasCulto || 6;
  const atualCulto = oficializadasCount + cultoOficialCount;

  const difRjm = aptasRjmCount - idealRjm;
  const difCulto = atualCulto - idealCulto;

  const handleOpenModal = (org = null) => {
    if (org) {
      setEditOrg(org);
      setFormData({ ...org });
    } else {
      setEditOrg(null);
      setFormData(initialForm);
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    onSaveOrganista({
      ...formData,
      id: editOrg ? editOrg.id : undefined
    });
    setModalOpen(false);
  };

  const filteredOrganistas = useMemo(() => {
    const list = organistas.filter(o => {
      const matchBusca = 
        (o.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (o.telefone || '').includes(busca) ||
        (o.nivel || '').toLowerCase().includes(busca.toLowerCase());
      const matchFase = filtroFase === 'Todos' || o.fase === filtroFase;
      return matchBusca && matchFase;
    });

    if (sortField) {
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
  }, [organistas, busca, filtroFase, sortField, sortDirection]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded">
              CCB SAM
            </span>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Gestão de Organistas</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Escala, níveis de aptidão (Candidata, RJM, Meia Hora, Culto Oficial e Oficialização) e diagnóstico por culto.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Organista</span>
        </button>
      </div>

      {/* Quadro Oficial: Quantidade Necessária de Organistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* RJM Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reunião de Jovens e Menores (RJM)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              difRjm < 0 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {difRjm < 0 ? 'Necessidade' : 'Adequado'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Qtde Ideal</span>
              <p className="text-xl font-extrabold text-slate-800">{idealRjm}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Qtde Atual</span>
              <p className="text-xl font-extrabold text-blue-700">{aptasRjmCount}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo</span>
              <p className={`text-xl font-black ${difRjm < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                {difRjm === 0 ? 'OK' : difRjm > 0 ? `+${difRjm}` : `${Math.abs(difRjm)}`}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>São necessárias no mínimo 3 organistas escaladas para a RJM semanal.</span>
          </p>
        </div>

        {/* Cultos Oficiais Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cultos Oficiais ({config?.cultosSemana || 2} por semana)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              difCulto > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {difCulto > 0 ? 'Excesso / Amplo' : 'Adequado'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Qtde Ideal</span>
              <p className="text-xl font-extrabold text-slate-800">{idealCulto}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Qtde Atual</span>
              <p className="text-xl font-extrabold text-purple-700">{atualCulto}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo</span>
              <p className="text-xl font-black text-slate-700">
                {difCulto > 0 ? `+${difCulto}` : difCulto === 0 ? 'OK' : `${difCulto}`}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excelente disponibilidade com {oficializadasCount} irmãs oficializadas na casa de oração.</span>
          </p>
        </div>

      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar organista por nome ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Filtro:</span>
          <select
            value={filtroFase}
            onChange={(e) => setFiltroFase(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="Todos">Todas as Fases ({organistas.length})</option>
            <option value="Oficializada">Oficializadas ({oficializadasCount})</option>
            <option value="Culto Oficial">Culto Oficial ({cultoOficialCount})</option>
            <option value="Candidata">Candidatas / Estudantes ({candidatasCount})</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                    <span>Nome da Organista</span>
                    {renderSortIcon('nome')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fase')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Fase"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Fase / Situação</span>
                    {renderSortIcon('fase')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('nivel')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Nível"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nível de Aptidão</span>
                    {renderSortIcon('nivel')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cultos')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Culto Oficial"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Cultos</span>
                    {renderSortIcon('cultos')}
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
                  onClick={() => handleSort('meiaHora')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Meia Hora"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Meia Hora</span>
                    {renderSortIcon('meiaHora')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('telefone')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Telefone"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Telefone / Contato</span>
                    {renderSortIcon('telefone')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('comum')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Comum"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Comum</span>
                    {renderSortIcon('comum')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrganistas.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    Nenhuma organista encontrada.
                  </td>
                </tr>
              ) : (
                filteredOrganistas.map((org, idx) => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{org.nome}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        org.fase === 'Oficializada' ? 'bg-purple-100 text-purple-800' :
                        org.fase === 'Culto Oficial' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {org.fase}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{org.nivel}</td>
                    <td className="py-3 px-4 text-center">
                      {org.cultos ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {org.rjm ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {org.meiaHora ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {org.telefone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {org.telefone}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{org.comum || 'Vila Rui Barbosa'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(org)}
                          title="Editar"
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente remover ${org.nome}?`)) {
                              onDeleteOrganista(org.id);
                            }
                          }}
                          title="Excluir"
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

      {/* Modal Organista */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editOrg ? 'Editar Organista' : 'Cadastrar Organista'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-purple-200 hover:text-white"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                  placeholder="Ex: Rosely Miurim"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fase Geral</label>
                  <select
                    value={formData.fase}
                    onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600 cursor-pointer font-semibold"
                  >
                    {fasesOptions.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nível de Aptidão</label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600 cursor-pointer font-semibold"
                  >
                    {niveisOptions.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / Contato</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                  placeholder="Ex: (11) 97647-0730"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comum Congregação</label>
                <input
                  type="text"
                  value={formData.comum}
                  onChange={(e) => setFormData({ ...formData, comum: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                  placeholder="Vila Rui Barbosa"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Permissões de Escala:</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cultos}
                      onChange={(e) => setFormData({ ...formData, cultos: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="font-semibold text-slate-700">Culto Oficial</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rjm}
                      onChange={(e) => setFormData({ ...formData, rjm: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="font-semibold text-slate-700">RJM</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.meiaHora}
                      onChange={(e) => setFormData({ ...formData, meiaHora: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="font-semibold text-slate-700">Meia Hora</span>
                  </label>
                </div>
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
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-bold shadow-sm"
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
