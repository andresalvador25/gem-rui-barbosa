import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Edit3, 
  Plus, 
  Printer, 
  BookOpen, 
  Award, 
  Calendar, 
  Music, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Database,
  Sparkles,
  Info
} from 'lucide-react';
import AlunoGemModal from './AlunoGemModal.jsx';
import LancamentoHistoricoModal from './LancamentoHistoricoModal.jsx';
import HistoricoAlunoView from './HistoricoAlunoView.jsx';

export default function FichaAlunoGemView({ canEdit = true, canDelete = true, onRefresh }) {
  const [alunos, setAlunos] = useState([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  // Modais
  const [isModalAlunoOpen, setIsModalAlunoOpen] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);

  const [isModalLancamentoOpen, setIsModalLancamentoOpen] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);

  // Modal Mobile Exclusivo para Tarefas & Lições do Candidato
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileShowCadastro, setMobileShowCadastro] = useState(false);

  const handleAlunoClick = (aluno) => {
    setSelectedAlunoId(aluno.id);
    // Se for celular / tablet (< 1024px), abre diretamente o modal com as tarefas do aluno
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileModalOpen(true);
    }
  };

  const ordenarPorNome = (lista = []) =>
    [...lista].sort((a, b) =>
      (a?.nome || '').trim().localeCompare((b?.nome || '').trim(), 'pt-BR', { sensitivity: 'base' })
    );

  // Carregar lista de alunos da API (ou localStorage)
  const carregarAlunos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gem/alunos');
      if (res.ok) {
        const json = await res.json();
        if (json.alunos && json.alunos.length > 0) {
          const ordenados = ordenarPorNome(json.alunos);
          setAlunos(ordenados);
          if (!selectedAlunoId && ordenados.length > 0) {
            setSelectedAlunoId(ordenados[0].id);
          }
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend offline, usando dados locais');
    }

    // Fallback localStorage
    const saved = localStorage.getItem('gem_alunos_storage');
    if (saved) {
      try {
        const parsed = ordenarPorNome(JSON.parse(saved));
        setAlunos(parsed);
        if (!selectedAlunoId && parsed.length > 0) setSelectedAlunoId(parsed[0].id);
      } catch (e) {}
    }
    setLoading(false);
  };

  // Carregar histórico do aluno selecionado
  const carregarHistorico = async (alunoId) => {
    if (!alunoId) return;
    try {
      const res = await fetch(`/api/gem/historico/${alunoId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.historico) {
          setHistorico(json.historico);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend offline para histórico, usando dados locais');
    }

    // Fallback localStorage
    const saved = localStorage.getItem(`gem_historico_${alunoId}`);
    if (saved) {
      try {
        setHistorico(JSON.parse(saved));
      } catch (e) {
        setHistorico([]);
      }
    } else {
      setHistorico([]);
    }
  };

  useEffect(() => {
    carregarAlunos();
    const handleSync = () => {
      carregarAlunos();
      if (selectedAlunoId) carregarHistorico(selectedAlunoId);
    };
    window.addEventListener('gem-data-updated', handleSync);
    return () => window.removeEventListener('gem-data-updated', handleSync);
  }, [selectedAlunoId]);

  useEffect(() => {
    if (selectedAlunoId) {
      carregarHistorico(selectedAlunoId);
    }
  }, [selectedAlunoId]);

  // Aluno atualmente selecionado
  const alunoAtual = alunos.find(a => a.id === selectedAlunoId) || alunos[0] || null;

  // Salvar ou Editar Aluno
  const handleSaveAluno = async (alunoData) => {
    try {
      const res = await fetch('/api/gem/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alunoData)
      });
      if (res.ok) {
        await carregarAlunos();
        if (onRefresh) onRefresh();
        window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: alunoData }));
      }
    } catch (e) {
      // Local fallback
      let updated;
      if (alunoData.id) {
        updated = alunos.map(a => a.id === alunoData.id ? alunoData : a);
      } else {
        const novo = { ...alunoData, id: Date.now() };
        updated = [...alunos, novo];
        setSelectedAlunoId(novo.id);
      }
      const ordenados = ordenarPorNome(updated);
      setAlunos(ordenados);
      localStorage.setItem('gem_alunos_storage', JSON.stringify(ordenados));
      if (onRefresh) onRefresh();
    }
    setIsModalAlunoOpen(false);
  };

  // Salvar ou Editar Lançamento no Histórico
  const handleSaveLancamento = async (itemData) => {
    try {
      const res = await fetch('/api/gem/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
        await carregarHistorico(selectedAlunoId);
        window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: itemData }));
      }
    } catch (e) {
      // Local fallback
      let updated;
      const existIdx = historico.findIndex(h => h.id === itemData.id);
      if (existIdx !== -1) {
        updated = historico.map(h => h.id === itemData.id ? itemData : h);
      } else {
        updated = [itemData, ...historico];
      }
      setHistorico(updated);
      localStorage.setItem(`gem_historico_${selectedAlunoId}`, JSON.stringify(updated));
    }
  };

  // Deletar Lançamento do Histórico
  const handleDeleteLancamento = async (id) => {
    if (!window.confirm('Deseja excluir este registro do histórico?')) return;
    try {
      await fetch(`/api/gem/historico/${id}`, { method: 'DELETE' });
      await carregarHistorico(selectedAlunoId);
      window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: { deletedId: id } }));
    } catch (e) {
      const updated = historico.filter(h => h.id !== id);
      setHistorico(updated);
      localStorage.setItem(`gem_historico_${selectedAlunoId}`, JSON.stringify(updated));
    }
  };

  // Filtrar e manter lista lateral de alunos em ordem alfabética
  const alunosFiltrados = ordenarPorNome(
    alunos.filter(a => 
      (a.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.instrumento && a.instrumento.toLowerCase().includes(busca.toLowerCase()))
    )
  );

  return (
    <div className="space-y-4 font-sans animate-fadeIn">
      {/* Banner Superior com Identificação e Supabase Tag */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/40 border border-blue-400/30 text-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Ficha Cadastral & Histórico GEM
              </span>
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3" />
                Estrutura Pronta p/ Supabase
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Gestão Individual de Alunos do GEM
            </h2>
            <p className="text-xs text-sky-200/80 mt-0.5">
              Edite as informações cadastrais e registre o histórico contínuo de aulas (MSA, MTS, Provas, Métodos, Hinário e Escalas).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  setAlunoEditando(null);
                  setIsModalAlunoOpen(true);
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Aluno</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition"
              title="Imprimir ficha do aluno"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal: Seletor de Alunos à Esquerda + Ficha e Histórico à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:block">
        
        {/* COLUNA ESQUERDA: LISTA DE ALUNOS (4 Colunas) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 no-print">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              Alunos do GEM ({alunos.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Selecione para ver</span>
          </div>

          {/* Busca Rápida de Alunos */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome ou instrumento..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Lista com Rolagem */}
          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {alunosFiltrados.map(aluno => {
              const isSelected = aluno.id === selectedAlunoId;
              return (
                <div
                  key={aluno.id}
                  onClick={() => handleAlunoClick(aluno)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <span className="font-black text-xs text-slate-900 block leading-tight truncate">
                      {aluno.nome}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold truncate">
                      <span className="text-blue-700 font-bold">{aluno.instrumento}</span>
                      <span>•</span>
                      <span className="truncate">{aluno.comum}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botão de ação rápida exclusivo para celular */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlunoId(aluno.id);
                          setLancamentoEditando(null);
                          setIsModalLancamentoOpen(true);
                        }}
                        className="lg:hidden flex items-center gap-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-xs transition"
                        title="Lançar lição diretamente"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Lição</span>
                      </button>
                    )}
                    <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: FICHA CADASTRAL + HISTÓRICO (8 Colunas) */}
        {/* No celular (< lg), oculta daqui para não esticar a tela embaixo; abre via modal rápido! */}
        <div className="hidden lg:block lg:col-span-8 space-y-4 print:block print:w-full">
          {alunoAtual ? (
            <>
              {/* Cabeçalho Exclusivo de Impressão */}
              <div className="print-only border-b-2 border-slate-900 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Congregação Cristã no Brasil • Vila Rui Barbosa — Jundiaí - SP
                    </p>
                    <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                      Ficha Cadastral & Histórico de Estudos — GEM
                    </h1>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <span className="block font-bold text-slate-700">Emitido em:</span>
                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* CARD DA FICHA CADASTRAL (IMAGEM 1) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-print print-avoid-break">
                {/* Header da Ficha */}
                <div className="bg-[#d9edf7] text-[#31708f] px-5 py-3 border-b border-[#bce8f1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center font-black text-[#31708f]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                        {alunoAtual.nome}
                      </h3>
                      <span className="text-[11px] font-bold text-[#31708f]">
                        {alunoAtual.instrumento} • {alunoAtual.comum}
                      </span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2 no-print">
                      <button
                        onClick={() => {
                          setAlunoEditando(alunoAtual);
                          setIsModalAlunoOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-white border border-[#bce8f1] hover:bg-slate-50 text-[#31708f] text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Cadastro</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid com Todos os Campos do Cadastro (Exatos da Imagem 1) */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 print-grid-3 gap-3.5 text-xs print:p-3 print:gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Cargo / Ministério</span>
                    <span className="font-extrabold text-slate-800 text-xs">{alunoAtual.cargo || alunoAtual.ministerio || 'MÚSICO'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Nível no GEM</span>
                    <span className="font-extrabold text-blue-700 text-xs">{alunoAtual.nivel || 'CANDIDATO(A)'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Tonalidade</span>
                    <span className="font-extrabold text-slate-800 text-xs">{alunoAtual.tonalidade || 'DÓ'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Possui Instrumento?</span>
                    <span className="font-bold flex items-center gap-1 text-slate-800">
                      {alunoAtual.possuiInstrumento === 'NÃO' ? (
                        <span className="text-red-600 font-extrabold">NÃO</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">SIM</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Instrumento Próprio?</span>
                    <span className="font-bold flex items-center gap-1 text-slate-800">
                      {alunoAtual.instrumentoProprio === 'NÃO' ? (
                        <span className="text-red-600 font-extrabold">NÃO</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">SIM</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Data Início GEM</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {alunoAtual.dataInicioGem ? alunoAtual.dataInicioGem.split('-').reverse().join('/') : '-'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Batizado(a)?</span>
                    <span className="font-bold flex items-center gap-1 text-slate-800">
                      {alunoAtual.batizado === false || alunoAtual.batizado === 'NÃO' ? (
                        <span className="text-red-600 font-extrabold">NÃO</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">SIM</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Telefone / Contato</span>
                    <span className="font-extrabold text-slate-800 text-xs">{alunoAtual.telefone || alunoAtual.contato || '-'}</span>
                  </div>
                </div>
              </div>

              {/* SEÇÃO DO HISTÓRICO CONTÍNUO DE AULAS E AVALIAÇÕES */}
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-3 print:bg-white print:p-3 card-print">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    Histórico de Aulas, Lições e Avaliações
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {historico.length} {historico.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <HistoricoAlunoView
                  historico={historico}
                  readOnly={!canEdit}
                  canDelete={canDelete}
                  onAddClick={() => {
                    setLancamentoEditando(null);
                    setIsModalLancamentoOpen(true);
                  }}
                  onEditClick={(item) => {
                    setLancamentoEditando(item);
                    setIsModalLancamentoOpen(true);
                  }}
                  onDeleteClick={handleDeleteLancamento}
                />
              </div>

              {/* Rodapé de Assinaturas Exclusivo para Impressão */}
              <div className="print-only pt-8 mt-6 print-avoid-break">
                <div className="grid grid-cols-2 gap-10 text-center text-[11px] text-slate-700">
                  <div className="border-t border-slate-400 pt-1.5">
                    <span className="font-bold block">Instrutor(a) Responsável</span>
                    <span className="text-[10px] text-slate-500">GEM • Vila Rui Barbosa</span>
                  </div>
                  <div className="border-t border-slate-400 pt-1.5">
                    <span className="font-bold block">Encarregado Local / Regional</span>
                    <span className="text-[10px] text-slate-500">Congregação Cristã no Brasil</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
              Nenhum aluno cadastrado.
            </div>
          )}
        </div>

      </div>

      {/* MODAL EXCLUSIVO MOBILE: TAREFAS, LIÇÕES E HISTÓRICO DO CANDIDATO */}
      {isMobileModalOpen && alunoAtual && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/75 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn font-sans">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header do Modal Mobile */}
            <div className="bg-[#d9edf7] text-[#31708f] px-4 py-3.5 border-b border-[#bce8f1] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center font-black text-[#31708f] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide truncate">
                    {alunoAtual.nome}
                  </h3>
                  <p className="text-[11px] font-bold text-[#31708f] truncate">
                    {alunoAtual.instrumento} • {alunoAtual.comum}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="text-[#31708f] hover:text-slate-900 p-1 rounded-lg hover:bg-white/50 transition shrink-0"
                title="Fechar"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Ações Rápidas no Topo do Modal */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setLancamentoEditando(null);
                    setIsModalLancamentoOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Lançar Lição / Tarefas</span>
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setAlunoEditando(alunoAtual);
                    setIsModalAlunoOpen(true);
                  }}
                  className="flex items-center gap-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-2.5 rounded-xl transition"
                  title="Editar dados cadastrais"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Cadastro</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileShowCadastro(!mobileShowCadastro)}
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-2.5 rounded-xl border transition ${
                  mobileShowCadastro
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>{mobileShowCadastro ? 'Ocultar' : 'Ficha'}</span>
              </button>
            </div>

            {/* Conteúdo com Rolagem */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Ficha Resumida (expansível) */}
              {mobileShowCadastro && (
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 space-y-2 text-xs animate-fadeIn">
                  <h4 className="font-extrabold text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Dados Cadastrais do Candidato
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-400 text-[10px] block uppercase">Nível:</span> <strong>{alunoAtual.nivel || 'CANDIDATO(A)'}</strong></div>
                    <div><span className="text-slate-400 text-[10px] block uppercase">Tonalidade:</span> <strong>{alunoAtual.tonalidade || 'DÓ'}</strong></div>
                    <div><span className="text-slate-400 text-[10px] block uppercase">Início GEM:</span> <strong>{alunoAtual.dataInicioGem ? alunoAtual.dataInicioGem.split('-').reverse().join('/') : '-'}</strong></div>
                    <div><span className="text-slate-400 text-[10px] block uppercase">Batizado(a):</span> <strong>{alunoAtual.batizado === false || alunoAtual.batizado === 'NÃO' ? 'NÃO' : 'SIM'}</strong></div>
                    <div className="col-span-2"><span className="text-slate-400 text-[10px] block uppercase">Contato:</span> <strong>{alunoAtual.telefone || alunoAtual.contato || '-'}</strong></div>
                  </div>
                </div>
              )}

              {/* Histórico e Tarefas do Aluno */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Histórico & Lições ({historico.length})
                  </h4>
                </div>

                <HistoricoAlunoView
                  historico={historico}
                  readOnly={!canEdit}
                  canDelete={canDelete}
                  onAddClick={() => {
                    setLancamentoEditando(null);
                    setIsModalLancamentoOpen(true);
                  }}
                  onEditClick={(item) => {
                    setLancamentoEditando(item);
                    setIsModalLancamentoOpen(true);
                  }}
                  onDeleteClick={handleDeleteLancamento}
                />
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileModalOpen(false)}
                className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: FICHA CADASTRAL DO ALUNO (IMAGEM 1) */}
      <AlunoGemModal
        isOpen={isModalAlunoOpen}
        onClose={() => setIsModalAlunoOpen(false)}
        onSave={handleSaveAluno}
        aluno={alunoEditando}
      />

      {/* MODAL 2: LANÇAMENTO DE ATIVIDADE / HISTÓRICO (IMAGENS 2, 3, 4, 5) */}
      {alunoAtual && (
        <LancamentoHistoricoModal
          isOpen={isModalLancamentoOpen}
          onClose={() => setIsModalLancamentoOpen(false)}
          onSave={handleSaveLancamento}
          aluno={alunoAtual}
          itemToEdit={lancamentoEditando}
        />
      )}
    </div>
  );
}
