import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Users, 
  Award, 
  Check, 
  X, 
  Search, 
  TrendingUp, 
  FileSpreadsheet, 
  Download, 
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function GemChamadaView({ gemAlunos, datas, presencas, onUpdatePresenca, onSaveAluno, onDeleteAluno }) {
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState({
    nome: '',
    instrumento: 'Violino',
    msa: 1,
    comum: 'Vila Rui Barbosa'
  });

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
      ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />;
  };

  const datasLista = datas && datas.length > 0 ? datas : [
    "2025-02-08", "2025-02-15", "2025-02-22", "2025-03-01", "2025-03-08", "2025-03-15",
    "2025-03-22", "2025-03-29", "2025-04-05", "2025-04-12", "2025-04-19", "2025-04-26",
    "2025-05-03", "2025-05-10", "2025-05-17", "2025-05-24", "2025-05-31", "2025-06-07"
  ];

  const handleCellClick = (alunoNome, dataStr) => {
    const current = presencas?.[alunoNome]?.[dataStr] || '';
    let next = 'c';
    if (current === 'c') next = 'x';
    else if (current === 'x') next = '';
    else next = 'c';

    onUpdatePresenca(alunoNome, dataStr, next);
  };

  // Contagem por aula
  const presentesPorData = (dataStr) => {
    let count = 0;
    gemAlunos.forEach(a => {
      if (presencas?.[a.nome]?.[dataStr] === 'c') count++;
    });
    return count;
  };

  // Dias com aula realizada (onde há pelo menos 1 registro)
  const aulasRealizadas = datasLista.filter(d => presentesPorData(d) > 0).length;

  // Média de presença
  const totalPresencasGerais = datasLista.reduce((acc, d) => acc + presentesPorData(d), 0);
  const mediaPorAula = aulasRealizadas > 0 ? (totalPresencasGerais / aulasRealizadas).toFixed(1) : '0.0';

  // Alunos filtrados e ordenados
  const alunosFiltrados = useMemo(() => {
    const list = gemAlunos.filter(a => 
      (a.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.instrumento || '').toLowerCase().includes(busca.toLowerCase())
    );

    if (sortField) {
      list.sort((a, b) => {
        if (sortField === 'total') {
          let countA = 0;
          let countB = 0;
          datasLista.forEach(d => {
            if (presencas?.[a.nome]?.[d] === 'c') countA++;
            if (presencas?.[b.nome]?.[d] === 'c') countB++;
          });
          return sortDirection === 'asc' ? countA - countB : countB - countA;
        }

        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [gemAlunos, busca, datasLista, presencas, sortField, sortDirection]);

  const handleCadastrarAluno = (e) => {
    e.preventDefault();
    if (!novoAluno.nome.trim()) return;
    onSaveAluno({
      ...novoAluno,
      status: 'Ativo',
      horarioMsa: '15h',
      instrutorMsa: 'ANDRÉ',
      horarioInst: '16h',
      instrutorInst: 'VANDER'
    });
    setNovoAluno({ nome: '', instrumento: 'Violino', msa: 1, comum: 'Vila Rui Barbosa' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded">
              GEM CCB
            </span>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <span>Livro de Chamada & Frequência do GEM</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle semanal de presença dos alunos do Grupo de Estudo Musical (Sábados). Clique na célula para alternar: <strong>'c' (Presente)</strong> &rarr; <strong>'x' (Falta)</strong> &rarr; <strong>Vazio</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Matricular Aluno</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Alunos Cadastrados</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{gemAlunos.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% integrados</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Aulas Registradas</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{aulasRealizadas}</p>
          <span className="text-[10px] text-slate-500">neste semestre</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Média Alunos / Aula</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{mediaPorAula}</p>
          <span className="text-[10px] text-slate-500">frequência média</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Método Atual</span>
          <p className="text-2xl font-black text-purple-700 mt-1">MSA</p>
          <span className="text-[10px] text-slate-500">Fases 1 a 16 CCB</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno no GEM..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> c = Presente
            </span>
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> x = Falta
            </span>
          </div>
        </div>

        {/* Large Attendance Matrix */}
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th 
                  onClick={() => handleSort('id')}
                  className="py-2.5 px-3 border-r border-slate-200 bg-slate-100 sticky left-0 z-20 w-10 text-center cursor-pointer select-none group hover:bg-slate-200 transition"
                  title="Ordenar por número"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>#</span>
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('nome')}
                  className="py-2.5 px-3 border-r border-slate-200 bg-slate-100 sticky left-10 z-20 w-48 min-w-[180px] cursor-pointer select-none group hover:bg-slate-200 transition"
                  title="Ordenar por Nome do Aluno"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Aluno</span>
                    {renderSortIcon('nome')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('instrumento')}
                  className="py-2.5 px-3 border-r border-slate-200 w-32 min-w-[120px] cursor-pointer select-none group hover:bg-slate-200 transition"
                  title="Ordenar por Instrumento"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instrumento</span>
                    {renderSortIcon('instrumento')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('msa')}
                  className="py-2.5 px-2 border-r border-slate-200 w-16 text-center cursor-pointer select-none group hover:bg-slate-200 transition"
                  title="Ordenar por Fase MSA"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>MSA</span>
                    {renderSortIcon('msa')}
                  </div>
                </th>
                
                {/* Date Columns */}
                {datasLista.map((d) => {
                  const [ano, mes, dia] = d.split('-');
                  return (
                    <th key={d} className="py-2.5 px-1 border-r border-slate-200 text-center w-12 min-w-[42px] font-mono">
                      <span className="block text-[9px] text-slate-400">{mes}</span>
                      <span className="text-[11px] text-slate-800">{dia}</span>
                    </th>
                  );
                })}

                <th 
                  onClick={() => handleSort('total')}
                  className="py-2.5 px-3 bg-slate-100 text-center w-16 cursor-pointer select-none group hover:bg-slate-200 transition"
                  title="Ordenar por Total de Presenças"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total</span>
                    {renderSortIcon('total')}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {alunosFiltrados.map((aluno, idx) => {
                let totalPresencasAluno = 0;
                datasLista.forEach(d => {
                  if (presencas?.[aluno.nome]?.[d] === 'c') totalPresencasAluno++;
                });

                return (
                  <tr key={aluno.id || idx} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 border-r border-slate-100 bg-white sticky left-0 z-10 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-100 bg-white sticky left-10 z-10 font-bold text-slate-900 truncate">
                      {aluno.nome}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-100 text-slate-700">
                      {aluno.instrumento}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-100 text-center font-extrabold text-purple-700 bg-purple-50/30">
                      Fase {aluno.msa || 1}
                    </td>

                    {/* Check cells */}
                    {datasLista.map((d) => {
                      const val = presencas?.[aluno.nome]?.[d] || '';
                      return (
                        <td
                          key={d}
                          onClick={() => handleCellClick(aluno.nome, d)}
                          className={`py-2 px-1 border-r border-slate-100 text-center font-black cursor-pointer transition select-none ${
                            val === 'c' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : val === 'x' 
                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' 
                              : 'hover:bg-slate-100 text-transparent'
                          }`}
                          title={`Clique para alterar presença de ${aluno.nome} em ${d}`}
                        >
                          {val || '-'}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-center font-black text-slate-900 bg-slate-50">
                      {totalPresencasAluno}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Totals */}
            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-200 sticky bottom-0 z-20 shadow-inner">
              <tr>
                <td colSpan="4" className="py-2.5 px-4 text-right uppercase text-[10px] tracking-wider font-extrabold">
                  Presentes por Aula:
                </td>
                {datasLista.map((d) => {
                  const qtd = presentesPorData(d);
                  return (
                    <td key={d} className="py-2.5 px-1 border-r border-slate-200 text-center font-black text-[11px] text-blue-900">
                      {qtd > 0 ? qtd : '-'}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-center font-black text-emerald-800 bg-emerald-50">
                  {totalPresencasGerais}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Matricular Novo Aluno */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Matricular Novo Aluno no GEM</h3>
              <button onClick={() => setModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarAluno} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Aluno</label>
                <input
                  type="text"
                  required
                  value={novoAluno.nome}
                  onChange={(e) => setNovoAluno({ ...novoAluno, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
                  placeholder="Ex: Matheus Lepera"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instrumento</label>
                <input
                  type="text"
                  required
                  value={novoAluno.instrumento}
                  onChange={(e) => setNovoAluno({ ...novoAluno, instrumento: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
                  placeholder="Ex: Violino, Trompa, Flauta..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fase Inicial MSA</label>
                <select
                  value={novoAluno.msa}
                  onChange={(e) => setNovoAluno({ ...novoAluno, msa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(f => (
                    <option key={f} value={f}>Fase {f}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
