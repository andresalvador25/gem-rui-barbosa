import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Sparkles,
  Music,
  Download,
  Printer
} from 'lucide-react';
import { ORGANISTAS_GEM_DATA } from '../constants/gemInitialData.js';
import AlunoGemModal from './AlunoGemModal.jsx';

export default function OrganistasGemView() {
  const [organistas, setOrganistas] = useState([]);

  const carregarOrganistas = async () => {
    try {
      const res = await fetch('/api/gem/alunos');
      if (res.ok) {
        const json = await res.json();
        if (json.alunos) {
          const listaOrg = json.alunos
            .filter(a => String(a.cargo || '').toUpperCase() === 'ORGANISTA' || String(a.instrumento || '').toUpperCase().includes('ÓRGÃO'))
            .map(a => ({
              ...a,
              ministerio: 'Organista',
              instrumento: 'Órgão Eletrônico',
              contato: a.telefone || a.contato || ''
            }));
          setOrganistas(listaOrg);
          localStorage.setItem('gem_organistas_salvas', JSON.stringify(listaOrg));
          return;
        }
      }
    } catch (e) {}
    const saved = localStorage.getItem('gem_organistas_salvas');
    if (saved) {
      try { setOrganistas(JSON.parse(saved)); return; } catch (e) {}
    }
    setOrganistas(ORGANISTAS_GEM_DATA);
  };

  useEffect(() => {
    carregarOrganistas();
    const handleSync = () => carregarOrganistas();
    window.addEventListener('gem-data-updated', handleSync);
    return () => window.removeEventListener('gem-data-updated', handleSync);
  }, []);

  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditItem({
      nome: '',
      comum: 'VILA RUI BARBOSA',
      cargo: 'ORGANISTA',
      instrumento: 'ÓRGÃO ELETRÔNICO',
      nivel: 'CANDIDATO(A)',
      possuiInstrumento: 'SIM',
      instrumentoProprio: 'SIM',
      tonalidade: 'DÓ',
      batizado: 'SIM',
      telefone: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta organista?')) {
      try {
        await fetch(`/api/gem/alunos/${id}`, { method: 'DELETE' });
        await carregarOrganistas();
        window.dispatchEvent(new CustomEvent('gem-data-updated'));
      } catch (e) {
        const filtered = organistas.filter(o => o.id !== id);
        setOrganistas(filtered);
        localStorage.setItem('gem_organistas_salvas', JSON.stringify(filtered));
      }
    }
  };

  // Filtros + Ordenação alfabética
  const filtrados = organistas
    .filter(item => {
      const matchBusca = (item.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (item.comum || '').toLowerCase().includes(busca.toLowerCase()) ||
        (item.contato && item.contato.includes(busca));
      
      if (filtroNivel === 'Todos') return matchBusca;
      if (filtroNivel === 'Candidata') return matchBusca && item.nivel.toLowerCase().includes('candidat');
      if (filtroNivel === 'RJM') return matchBusca && (item.nivel === 'RJM' || item.nivel.includes('RJM'));
      if (filtroNivel === 'Culto Oficial') return matchBusca && item.nivel.toLowerCase().includes('culto');
      return matchBusca;
    })
    .sort((a, b) => (a?.nome || '').trim().localeCompare((b?.nome || '').trim(), 'pt-BR', { sensitivity: 'base' }));

  // Estatísticas
  const total = organistas.length;
  const candidatas = organistas.filter(o => o.nivel.toLowerCase().includes('candidat')).length;
  const rjm = organistas.filter(o => o.nivel.includes('RJM')).length;
  const oficializadas = organistas.filter(o => o.nivel.toLowerCase().includes('culto') || o.nivel.toLowerCase().includes('oficial')).length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Cabeçalho Exclusivo de Impressão */}
      <div className="print-only border-b-2 border-slate-900 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Congregação Cristã no Brasil • Vila Rui Barbosa — Jundiaí - SP
            </p>
            <h1 className="text-base font-black uppercase text-slate-900">
              Relação de Organistas GEM
            </h1>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <span className="block font-bold">
              Total: {total} ({candidatas} Cand. • {rjm} RJM • {oficializadas} Culto Ofic.)
            </span>
            <span>Emitido em: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Banner Superior com Estatísticas */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-purple-800/40 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-600/40 border border-purple-400/30 text-purple-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Planilha Oficial GEM • Vila Rui Barbosa
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
              <Music className="w-5 h-5 text-purple-400" />
              Relação de Organistas GEM
            </h2>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Cadastro e controle de alunas e organistas do Grupo de Estudos Musicais.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Organista</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition"
              title="Imprimir relação de organistas"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Cards Rápidos de Totais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-800/60 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-purple-300 font-semibold block text-[11px]">Total Organistas</span>
            <span className="text-xl font-black text-white">{total}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-pink-300 font-semibold block text-[11px]">Candidatas</span>
            <span className="text-xl font-black text-pink-300">{candidatas}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-amber-300 font-semibold block text-[11px]">RJM / Meia Hora</span>
            <span className="text-xl font-black text-amber-300">{rjm}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 font-semibold block text-[11px]">Culto Oficial</span>
            <span className="text-xl font-black text-emerald-300">{oficializadas}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        {/* Barra de Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, comum ou telefone..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
          />
        </div>

        {/* Pílulas de Filtro de Nível */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['Todos', 'Candidata', 'Ensaio', 'RJM', 'Culto Oficial'].map(nivel => (
            <button
              key={nivel}
              onClick={() => setFiltroNivel(nivel)}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition ${
                filtroNivel === nivel
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {nivel}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE ORGANISTAS GEM (EXCEL STYLE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-print print-visible">
        <div className="overflow-x-auto print-visible">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-700">
                <th className="py-2.5 px-4">NOME</th>
                <th className="py-2.5 px-3">COMUM CONGREGAÇÃO</th>
                <th className="py-2.5 px-3">MINISTÉRIO</th>
                <th className="py-2.5 px-3">INSTRUMENTO</th>
                <th className="py-2.5 px-3 text-center">NÍVEL</th>
                <th className="py-2.5 px-3">CONTATO / TELEFONE</th>
                <th className="py-2.5 px-3 text-center w-20 no-print">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                    Nenhuma organista encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtrados.map((item, idx) => {
                  let nivelBadge = 'bg-pink-100 text-pink-800 border-pink-300';
                  if (item.nivel.includes('RJM') && item.nivel.includes('Meia')) {
                    nivelBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                  } else if (item.nivel.toLowerCase().includes('ensaio')) {
                    nivelBadge = 'bg-purple-100 text-purple-800 border-purple-300';
                  } else if (item.nivel.includes('RJM')) {
                    nivelBadge = 'bg-blue-100 text-blue-800 border-blue-300';
                  } else if (item.nivel.toLowerCase().includes('culto')) {
                    nivelBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  }

                  const phoneClean = item.contato ? item.contato.replace(/\D/g, '') : '';

                  return (
                    <tr key={item.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                      <td className="py-2 px-4 font-black text-slate-900 whitespace-nowrap">
                        <span
                          onClick={() => handleOpenEdit(item)}
                          className="hover:text-purple-700 hover:underline cursor-pointer transition"
                          title={`Clique para abrir os dados de ${item.nome}`}
                        >
                          {item.nome}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-600">
                        {item.comum}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-semibold">
                        {item.ministerio}
                      </td>
                      <td className="py-2 px-3 text-purple-700 font-bold">
                        {item.instrumento}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border inline-block ${nivelBadge}`}>
                          {item.nivel}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {item.contato ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700 font-semibold">{item.contato}</span>
                            {phoneClean.length >= 10 && (
                              <a
                                href={`https://wa.me/55${phoneClean}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 transition"
                                title="Abrir WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-500 hover:text-purple-600 transition rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-2 px-4">TOTAL: {filtrados.length} ORGANISTAS</td>
                <td colSpan="6" className="py-2 px-3 text-right text-slate-500 text-[11px]">
                  Vila Rui Barbosa • Jundiaí
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL FICHA CADASTRAL UNIFICADA DA ORGANISTA */}
      <AlunoGemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aluno={editItem}
        onSave={() => {
          setIsModalOpen(false);
          carregarOrganistas();
        }}
      />
    </div>
  );
}
