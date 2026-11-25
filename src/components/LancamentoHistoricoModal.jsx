import React, { useState, useEffect } from 'react';
import { User, X, Save, Calendar, Plus, BookOpen, Award, Music, CheckSquare } from 'lucide-react';

export default function LancamentoHistoricoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  aluno,
  itemToEdit = null 
}) {
  const [activeTab, setActiveTab] = useState('MSA'); // 'MTS', 'MSA', 'Prova', 'Método', 'Hinário', 'Escalas'

  // Estado geral do formulário de lançamento
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    
    // MSA / MTS
    faseDe: 'Fase 1',
    faseAte: 'Fase 1',
    paginaDe: '',
    paginaAte: '',
    licaoDe: '',
    licaoAte: '',
    claves: ['Sol'],
    
    // Prova
    metodoAvaliacao: 'MSA', // 'MSA' ou 'MTS'
    nota: '',
    
    // Método
    metodoNome: '',
    
    // Hinário
    hino: '',
    hinoVoz: 'Soprano',
    hinosAdicionados: [],
    
    // Escalas
    tonalidadeEscala: 'Dó Maior',
    
    // Comuns
    observacoes: '',
    autorizadoPor: 'Instrutor de Cordas'
  });

  useEffect(() => {
    if (itemToEdit) {
      setActiveTab(itemToEdit.tipo || 'MSA');
      setFormData({
        data: itemToEdit.data || new Date().toISOString().split('T')[0],
        faseDe: itemToEdit.faseDe || 'Fase 1',
        faseAte: itemToEdit.faseAte || 'Fase 1',
        paginaDe: itemToEdit.paginaDe || '',
        paginaAte: itemToEdit.paginaAte || '',
        licaoDe: itemToEdit.licaoDe || '',
        licaoAte: itemToEdit.licaoAte || '',
        claves: itemToEdit.claves || ['Sol'],
        metodoAvaliacao: itemToEdit.metodo || 'MSA',
        nota: itemToEdit.nota || '',
        metodoNome: itemToEdit.metodo || '',
        hino: itemToEdit.hino || '',
        hinoVoz: itemToEdit.hinoVoz || 'Soprano',
        hinosAdicionados: itemToEdit.hinosAdicionados || [],
        tonalidadeEscala: itemToEdit.tonalidadeEscala || 'Dó Maior',
        observacoes: itemToEdit.observacoes || '',
        autorizadoPor: itemToEdit.autorizadoPor || 'Instrutor de Cordas'
      });
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        faseDe: 'Fase 1',
        faseAte: 'Fase 1',
        paginaDe: '',
        paginaAte: '',
        licaoDe: '',
        licaoAte: '',
        claves: ['Sol'],
        metodoAvaliacao: 'MSA',
        nota: '',
        metodoNome: '',
        hino: '',
        hinoVoz: 'Soprano',
        hinosAdicionados: [],
        tonalidadeEscala: 'Dó Maior',
        observacoes: '',
        autorizadoPor: 'Instrutor de Cordas'
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen || !aluno) return null;

  const toggleClave = (clave) => {
    setFormData(prev => {
      const exists = prev.claves.includes(clave);
      const novas = exists ? prev.claves.filter(c => c !== clave) : [...prev.claves, clave];
      return { ...prev, claves: novas };
    });
  };

  const handleAddHino = () => {
    if (!formData.hino.trim()) return;
    const item = `${formData.hino.trim()} (${formData.hinoVoz})`;
    setFormData(prev => ({
      ...prev,
      hinosAdicionados: [...prev.hinosAdicionados, item],
      hino: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: itemToEdit ? itemToEdit.id : Date.now(),
      alunoId: aluno.id,
      tipo: activeTab,
      data: formData.data,
      faseDe: formData.faseDe,
      faseAte: formData.faseAte,
      paginaDe: formData.paginaDe,
      paginaAte: formData.paginaAte,
      licaoDe: formData.licaoDe,
      licaoAte: formData.licaoAte,
      claves: formData.claves,
      metodo: activeTab === 'Prova' ? formData.metodoAvaliacao : formData.metodoNome,
      nota: formData.nota,
      hino: formData.hinosAdicionados.length > 0 ? formData.hinosAdicionados.join(', ') : formData.hino,
      hinoVoz: formData.hinoVoz,
      hinosAdicionados: formData.hinosAdicionados,
      tonalidadeEscala: formData.tonalidadeEscala,
      observacoes: formData.observacoes,
      autorizadoPor: formData.autorizadoPor,
      createdAt: itemToEdit?.createdAt || new Date().toISOString()
    };
    onSave(payload);
    onClose();
  };

  // Lista de Fases e Módulos
  const listaFases = Array.from({ length: 16 }, (_, i) => `Fase ${i + 1}`);
  const listaModulosMts = Array.from({ length: 12 }, (_, i) => `Módulo ${i + 1}`);

  // Métodos CCB por instrumento
  const metodosCCB = [
    'Método Prático de Violino (Laoureux)',
    'Método de Violino (Schradieck / Wohlfahrt)',
    'Método de Viola (Bruni / Kayser)',
    'Método de Violoncelo (Dotzauer / Lee)',
    'Método de Flauta (Taffanel / Kohler)',
    'Método de Clarinete (Klosé / Bona)',
    'Método de Saxofone (Ameller / Giampieri)',
    'Método de Trompete (Arban / Beeler)',
    'Método de Trompa (Kopprasch / Alphonse)',
    'Método de Trombone / Eufônio (Arban / Rochut)',
    'Método de Tuba (Arban / Blazhevich)',
    'Método de Órgão (Schmoll / Kohler / Hanon)',
    'Bona (Método Completo de Divisão Musical)',
    'Outro Método'
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden space-y-0">
        
        {/* Barra Superior Azul Clara (Exato da Imagem: '👤 DAVI EVANGELISTA / VIOLINO') */}
        <div className="bg-[#d9edf7] text-[#31708f] px-5 py-3 border-b border-[#bce8f1] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wide">
            <User className="w-4 h-4 text-[#31708f]" />
            <span>{aluno.nome}</span>
            <span className="text-[#31708f]/60">/</span>
            <span>{aluno.instrumento}</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#31708f] hover:text-slate-900 p-1 rounded-md transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Abas (Exato da Imagem: MTS | MSA | Prova | Método | Hinário | Escalas) */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 text-xs font-bold overflow-x-auto">
          {['MTS', 'MSA', 'Prova', 'Método', 'Hinário', 'Escalas'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 transition-all duration-150 border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#0f4c81] text-[#0f4c81] bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Formulário Interativo Conforme a Aba Selecionada */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* CAMPO DATA * (Comum a todas as abas) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Data *
            </label>
            <div className="sm:col-span-3">
              <input
                type="date"
                required
                value={formData.data}
                onChange={e => setFormData({ ...formData, data: e.target.value })}
                className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              />
            </div>
          </div>

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA MSA (IMAGEM 2) */}
          {/* ================================================================= */}
          {activeTab === 'MSA' && (
            <>
              {/* Fases * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Fases *
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <select
                    value={formData.faseDe}
                    onChange={e => setFormData({ ...formData, faseDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  >
                    <option value="">Fase de</option>
                    {listaFases.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select
                    value={formData.faseAte}
                    onChange={e => setFormData({ ...formData, faseAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  >
                    <option value="">Fase até</option>
                    {listaFases.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Páginas * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Páginas *
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Página de"
                    value={formData.paginaDe}
                    onChange={e => setFormData({ ...formData, paginaDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                  <input
                    type="text"
                    placeholder="Página até"
                    value={formData.paginaAte}
                    onChange={e => setFormData({ ...formData, paginaAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Lições */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Lições
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Lição de"
                    value={formData.licaoDe}
                    onChange={e => setFormData({ ...formData, licaoDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                  <input
                    type="text"
                    placeholder="Lição até"
                    value={formData.licaoAte}
                    onChange={e => setFormData({ ...formData, licaoAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Clave (Checkboxes) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Clave
                </label>
                <div className="sm:col-span-3 flex items-center gap-6 text-slate-700 font-semibold">
                  {['Sol', 'Dó', 'Fá'].map(cl => (
                    <label key={cl} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.claves.includes(cl)}
                        onChange={() => toggleClave(cl)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{cl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA PROVA (IMAGEM 3) */}
          {/* ================================================================= */}
          {activeTab === 'Prova' && (
            <>
              {/* Método * (Radio MSA / MTS) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Método *
                </label>
                <div className="sm:col-span-3 flex items-center gap-6 text-slate-700 font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="metodoAvaliacao"
                      value="MSA"
                      checked={formData.metodoAvaliacao === 'MSA'}
                      onChange={() => setFormData({ ...formData, metodoAvaliacao: 'MSA' })}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>MSA</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="metodoAvaliacao"
                      value="MTS"
                      checked={formData.metodoAvaliacao === 'MTS'}
                      onChange={() => setFormData({ ...formData, metodoAvaliacao: 'MTS' })}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>MTS</span>
                  </label>
                </div>
              </div>

              {/* Fases * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Fases *
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <select
                    value={formData.faseDe}
                    onChange={e => setFormData({ ...formData, faseDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  >
                    <option value="">Fase de</option>
                    {(formData.metodoAvaliacao === 'MSA' ? listaFases : listaModulosMts).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <select
                    value={formData.faseAte}
                    onChange={e => setFormData({ ...formData, faseAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  >
                    <option value="">Fase até</option>
                    {(formData.metodoAvaliacao === 'MSA' ? listaFases : listaModulosMts).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nota * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Nota *
                </label>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    placeholder="Exemplo: 7,50 ou 10,00."
                    value={formData.nota}
                    onChange={e => setFormData({ ...formData, nota: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600 font-bold"
                  />
                </div>
              </div>
            </>
          )}

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA MÉTODO (IMAGEM 4) */}
          {/* ================================================================= */}
          {activeTab === 'Método' && (
            <>
              {/* Método * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Método *
                </label>
                <div className="sm:col-span-3">
                  <select
                    value={formData.metodoNome}
                    onChange={e => setFormData({ ...formData, metodoNome: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600 font-semibold"
                  >
                    <option value="">Selecione o método..</option>
                    {metodosCCB.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Páginas */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Páginas
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Página inicial"
                    value={formData.paginaDe}
                    onChange={e => setFormData({ ...formData, paginaDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                  <input
                    type="text"
                    placeholder="Página final"
                    value={formData.paginaAte}
                    onChange={e => setFormData({ ...formData, paginaAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Lições */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Lições
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Lição inicial"
                    value={formData.licaoDe}
                    onChange={e => setFormData({ ...formData, licaoDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                  <input
                    type="text"
                    placeholder="Lição final"
                    value={formData.licaoAte}
                    onChange={e => setFormData({ ...formData, licaoAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA HINÁRIO (IMAGEM 5) */}
          {/* ================================================================= */}
          {activeTab === 'Hinário' && (
            <>
              {/* Hino * */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Hino *
                </label>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Informe o hino (ex: Hino 15)"
                    value={formData.hino}
                    onChange={e => setFormData({ ...formData, hino: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600 font-semibold"
                  />
                  <select
                    value={formData.hinoVoz}
                    onChange={e => setFormData({ ...formData, hinoVoz: e.target.value })}
                    className="w-36 px-2.5 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 font-semibold"
                  >
                    <option value="">-Selecione a voz-</option>
                    <option value="Soprano">Soprano</option>
                    <option value="Contralto">Contralto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Baixo">Baixo</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddHino}
                    className="w-9 h-9 rounded-lg bg-[#00b0f0] hover:bg-[#0094cc] text-white flex items-center justify-center font-bold text-lg shadow-sm transition"
                    title="Adicionar hino à lista"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Lista de hinos adicionados */}
              {formData.hinosAdicionados.length > 0 && (
                <div className="sm:ml-[25%] flex flex-wrap gap-1.5 pt-1">
                  {formData.hinosAdicionados.map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-300 text-cyan-900 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {h}
                      <button 
                        type="button" 
                        onClick={() => setFormData(p => ({ ...p, hinosAdicionados: p.hinosAdicionados.filter((_, idx) => idx !== i) }))}
                        className="text-cyan-700 hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA MTS */}
          {/* ================================================================= */}
          {activeTab === 'MTS' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Módulos *
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <select
                    value={formData.faseDe}
                    onChange={e => setFormData({ ...formData, faseDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800"
                  >
                    <option value="">Módulo de</option>
                    {listaModulosMts.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    value={formData.faseAte}
                    onChange={e => setFormData({ ...formData, faseAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800"
                  >
                    <option value="">Módulo até</option>
                    {listaModulosMts.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-slate-700 text-right sm:pr-4">
                  Páginas
                </label>
                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Página de"
                    value={formData.paginaDe}
                    onChange={e => setFormData({ ...formData, paginaDe: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Página até"
                    value={formData.paginaAte}
                    onChange={e => setFormData({ ...formData, paginaAte: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* ================================================================= */}
          {/* CONTEÚDO DA ABA ESCALAS */}
          {/* ================================================================= */}
          {activeTab === 'Escalas' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <label className="font-bold text-slate-700 text-right sm:pr-4">
                Escala / Tonalidade *
              </label>
              <div className="sm:col-span-3">
                <select
                  value={formData.tonalidadeEscala}
                  onChange={e => setFormData({ ...formData, tonalidadeEscala: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 font-semibold"
                >
                  <option value="Dó Maior (1 oitava)">Dó Maior (1 oitava)</option>
                  <option value="Dó Maior (2 oitavas)">Dó Maior (2 oitavas)</option>
                  <option value="Sol Maior (2 oitavas)">Sol Maior (2 oitavas)</option>
                  <option value="Ré Maior (2 oitavas)">Ré Maior (2 oitavas)</option>
                  <option value="Lá Maior (2 oitavas)">Lá Maior (2 oitavas)</option>
                  <option value="Mi Maior">Mi Maior</option>
                  <option value="Fá Maior">Fá Maior</option>
                  <option value="Si Bemol Maior">Si Bemol Maior</option>
                  <option value="Mi Bemol Maior">Mi Bemol Maior</option>
                  <option value="Lá Menor">Lá Menor</option>
                  <option value="Ré Menor">Ré Menor</option>
                  <option value="Arpejos e Cromáticas">Arpejos e Cromáticas</option>
                </select>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* OBSERVAÇÕES (TEXTAREA) - COMUM A TODAS AS ABAS */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 pt-1">
            <label className="font-bold text-slate-700 text-right sm:pr-4 pt-2">
              Observações
            </label>
            <div className="sm:col-span-3">
              <textarea
                rows={3}
                placeholder="Descreva a atividade realizada na aula"
                value={formData.observacoes}
                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 focus:border-blue-600 resize-none"
              ></textarea>
            </div>
          </div>

          {/* ================================================================= */}
          {/* AUTORIZADO POR * / AUTORIZANTE * - COMUM A TODAS AS ABAS */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              {activeTab === 'Método' || activeTab === 'Hinário' || activeTab === 'Escalas' ? 'Autorizante *' : 'Autorizado por *'}
            </label>
            <div className="sm:col-span-3">
              <select
                value={formData.autorizadoPor}
                onChange={e => setFormData({ ...formData, autorizadoPor: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none text-slate-800 font-semibold focus:border-blue-600"
              >
                <option value="">Selecione o responsável.</option>
                <option value="Instrutor de Cordas">Instrutor de Cordas</option>
                <option value="Instrutor de Madeiras">Instrutor de Madeiras</option>
                <option value="Instrutor de Metais">Instrutor de Metais</option>
                <option value="Instrutora de Órgão">Instrutora de Órgão</option>
                <option value="Encarregado Local">Encarregado Local</option>
                <option value="Encarregado Regional">Encarregado Regional</option>
              </select>
            </div>
          </div>

          {/* BOTÕES INFERIORES: Fechar e Salvar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg transition"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold px-6 py-2 rounded-lg transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
