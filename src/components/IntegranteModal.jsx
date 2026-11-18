import React, { useState, useEffect } from 'react';
import { X, Check, User, Phone } from 'lucide-react';
import { INSTRUMENTOS_CCB, detectarNaipe } from '../constants/instruments.js';
import { flagsFromNivel, nivelFromFlags } from '../utils/gemSync.js';

export default function IntegranteModal({ isOpen, onClose, onSave, itemToEdit }) {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Músico',
    instrumento: 'Violino',
    naipe: 'Cordas',
    nivel: 'OFICIALIZADO',
    comum: 'VILA RUI BARBOSA',
    ensaios: true,
    rjm: false,
    meiaHora: false,
    cultosOficiais: true,
    oficializado: true,
    batizado: true,
    telefone: '',
    observacao: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (itemToEdit) {
      const nivel = itemToEdit.nivel ? String(itemToEdit.nivel).toUpperCase().trim() : nivelFromFlags(itemToEdit);
      setFormData({
        id: itemToEdit.id,
        gemId: itemToEdit.gemId,
        nome: itemToEdit.nome || '',
        categoria: itemToEdit.categoria || 'Músico',
        instrumento: itemToEdit.instrumento || 'Violino',
        naipe: itemToEdit.naipe || detectarNaipe(itemToEdit.instrumento, itemToEdit.categoria),
        nivel,
        comum: (itemToEdit.comum || 'VILA RUI BARBOSA').toUpperCase(),
        possuiInstrumento: itemToEdit.possuiInstrumento || 'SIM',
        instrumentoProprio: itemToEdit.instrumentoProprio || 'SIM',
        tonalidade: itemToEdit.tonalidade || 'DÓ',
        dataInicioGem: itemToEdit.dataInicioGem || '',
        ensaios: !!itemToEdit.ensaios,
        rjm: !!itemToEdit.rjm,
        meiaHora: !!itemToEdit.meiaHora,
        cultosOficiais: !!itemToEdit.cultosOficiais,
        oficializado: itemToEdit.oficializado !== false,
        batizado: itemToEdit.batizado !== false,
        telefone: itemToEdit.telefone || '',
        observacao: itemToEdit.observacao || ''
      });
    } else {
      setFormData({
        nome: '',
        categoria: 'Músico',
        instrumento: 'Violino',
        naipe: 'Cordas',
        nivel: 'OFICIALIZADO',
        comum: 'VILA RUI BARBOSA',
        ensaios: true,
        rjm: false,
        meiaHora: false,
        cultosOficiais: true,
        oficializado: true,
        batizado: true,
        telefone: '',
        observacao: ''
      });
    }
    setErrors({});
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCategoriaChange = (categoria) => {
    if (categoria === 'Organista') {
      setFormData(prev => ({
        ...prev,
        categoria: 'Organista',
        instrumento: 'Órgão Eletrônico',
        naipe: 'Teclas / Organistas'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categoria: 'Músico',
        instrumento: prev.instrumento === 'Órgão Eletrônico' ? 'Violino' : prev.instrumento,
        naipe: prev.instrumento === 'Órgão Eletrônico' ? 'Cordas' : prev.naipe,
        meiaHora: false
      }));
    }
  };

  const handleInstrumentoChange = (instrumento) => {
    const naipe = detectarNaipe(instrumento, formData.categoria);
    setFormData(prev => ({
      ...prev,
      instrumento,
      naipe
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.nome.trim()) {
      errs.nome = 'Por favor, informe o nome do integrante';
    }
    if (!formData.instrumento.trim()) {
      errs.instrumento = 'Por favor, informe o instrumento';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      ...formData,
      nome: formData.nome.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/40 flex items-center justify-center border border-blue-400/30">
              <User className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {formData.id ? 'Editar Integrante' : 'Novo Integrante'}
              </h2>
              <p className="text-xs text-blue-200">Corpo Musical Vila Rui Barbosa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              autoFocus
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Marcelo Teixeira de Sena"
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white transition outline-none ${
                errors.nome ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoriaChange('Músico')}
                className={`py-2 px-3 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                  formData.categoria === 'Músico'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🎺 Músico</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoriaChange('Organista')}
                className={`py-2 px-3 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                  formData.categoria === 'Organista'
                    ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🎹 Organista</span>
              </button>
            </div>
          </div>

          {/* Instrumento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Instrumento *
              </label>
              {formData.categoria === 'Organista' ? (
                <input
                  type="text"
                  readOnly
                  value="Órgão Eletrônico"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-medium"
                />
              ) : (
                <select
                  value={formData.instrumento}
                  onChange={e => handleInstrumentoChange(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                >
                  <optgroup label="🎻 Cordas">
                    <option value="Violino">Violino</option>
                    <option value="Viola">Viola</option>
                    <option value="Violoncelo">Violoncelo</option>
                  </optgroup>
                  <optgroup label="🪵 Madeiras">
                    <option value="Flauta">Flauta</option>
                    <option value="Oboé">Oboé</option>
                    <option value="Clarinete">Clarinete</option>
                    <option value="Clarinete Alto">Clarinete Alto</option>
                    <option value="Clarone (Clarinete Baixo)">Clarone (Clarinete Baixo)</option>
                    <option value="Fagote">Fagote</option>
                    <option value="Saxofone Soprano">Saxofone Soprano</option>
                    <option value="Saxofone Alto">Saxofone Alto</option>
                    <option value="Saxofone Tenor">Saxofone Tenor</option>
                    <option value="Saxofone Barítono">Saxofone Barítono</option>
                  </optgroup>
                  <optgroup label="🎺 Metais">
                    <option value="Trompete">Trompete</option>
                    <option value="Cornet">Cornet</option>
                    <option value="Flugelhorn">Flugelhorn</option>
                    <option value="Trompa">Trompa</option>
                    <option value="Trombone">Trombone</option>
                    <option value="Trombonito">Trombonito</option>
                    <option value="Eufônio">Eufônio</option>
                    <option value="Barítono">Barítono</option>
                    <option value="Tuba">Tuba</option>
                  </optgroup>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Naipe / Família
              </label>
              <input
                type="text"
                readOnly
                value={formData.naipe}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-bold"
              />
            </div>
          </div>

          {/* Nível (Sincronizado com GEM e RJM) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nível *
              </label>
              <select
                value={formData.nivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : (formData.nivel || 'OFICIALIZADO')}
                onChange={e => {
                  const novoNivel = e.target.value;
                  const flags = flagsFromNivel(novoNivel, formData.meiaHora);
                  setFormData(prev => ({
                    ...prev,
                    nivel: novoNivel,
                    ...flags
                  }));
                }}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-800 transition"
              >
                <option value="CANDIDATO(A)">CANDIDATO(A)</option>
                <option value="CULTO OFICIAL">CULTO OFICIAL</option>
                <option value="ENSAIO">ENSAIO</option>
                <option value="MEIA HORA">MEIA HORA</option>
                <option value="OFICIALIZADO">OFICIALIZADO</option>
                <option value="RJM">RJM</option>
                <option value="RJM / CULTOS OFICIAIS">RJM / CULTOS OFICIAIS</option>
                <option value="RJM / ENSAIOS">RJM / ENSAIOS</option>
                <option value="RJM / MEIA HORA">RJM / MEIA HORA</option>
                <option value="RJM / OFICIALIZADO">RJM / OFICIALIZADO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Comum Congregação
              </label>
              <select
                value={formData.comum || 'VILA RUI BARBOSA'}
                onChange={e => setFormData({ ...formData, comum: e.target.value })}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-slate-800 transition"
              >
                <option value="VILA RUI BARBOSA">VILA RUI BARBOSA</option>
                <option value="JARDIM DO LAGO">JARDIM DO LAGO</option>
                <option value="PONTE SÃO JOÃO">PONTE SÃO JOÃO</option>
                <option value="JARDIM TARUMÃ">JARDIM TARUMÃ</option>
                <option value="MARINGÁ">MARINGÁ</option>
                <option value="STA. GERTRUDES">STA. GERTRUDES</option>
                <option value="TERRA NOVA">TERRA NOVA</option>
                <option value="OUTRA">OUTRA CONGREGAÇÃO</option>
              </select>
            </div>
          </div>

          {/* Colunas Exatas da Planilha: Checkboxes de Atuação */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Atuação Musical (Sincronizado com o Nível)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.oficializado}
                  onChange={e => {
                    const updated = { ...formData, oficializado: e.target.checked };
                    updated.nivel = nivelFromFlags(updated);
                    setFormData(updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>⭐ Oficializado (S/N)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.batizado}
                  onChange={e => setFormData({ ...formData, batizado: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>💧 Batizado (S/N)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cultosOficiais}
                  onChange={e => {
                    const updated = { ...formData, cultosOficiais: e.target.checked };
                    updated.nivel = nivelFromFlags(updated);
                    setFormData(updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>🎵 Cultos Oficiais</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rjm}
                  onChange={e => {
                    const updated = { ...formData, rjm: e.target.checked };
                    updated.nivel = nivelFromFlags(updated);
                    setFormData(updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>👦 RJM (Não casados)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ensaios}
                  onChange={e => {
                    const updated = { ...formData, ensaios: e.target.checked };
                    updated.nivel = nivelFromFlags(updated);
                    setFormData(updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>🎼 Ensaios</span>
              </label>

              {formData.categoria === 'Organista' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.meiaHora}
                    onChange={e => {
                      const updated = { ...formData, meiaHora: e.target.checked };
                      updated.nivel = nivelFromFlags(updated);
                      setFormData(updated);
                    }}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <span>⏱️ Meia Hora (Irmãs)</span>
                </label>
              )}
            </div>
          </div>

          {/* Dados do Instrumento e GEM (Unificados) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tonalidade
              </label>
              <select
                value={formData.tonalidade || 'DÓ'}
                onChange={e => setFormData({ ...formData, tonalidade: e.target.value })}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800 outline-none"
              >
                <option value="DÓ">DÓ</option>
                <option value="SIb">SIb</option>
                <option value="MIb">MIb</option>
                <option value="FÁ">FÁ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Possui Inst.?
              </label>
              <select
                value={formData.possuiInstrumento || 'SIM'}
                onChange={e => setFormData({ ...formData, possuiInstrumento: e.target.value })}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800 outline-none"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Inst. Próprio?
              </label>
              <select
                value={formData.instrumentoProprio || 'SIM'}
                onChange={e => setFormData({ ...formData, instrumentoProprio: e.target.value })}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800 outline-none"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Início GEM
              </label>
              <input
                type="date"
                value={formData.dataInicioGem || ''}
                onChange={e => setFormData({ ...formData, dataInicioGem: e.target.value })}
                className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Telefone e Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="Ex: (11) 98410-1299"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Observações
              </label>
              <input
                type="text"
                value={formData.observacao || ''}
                onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Opcional"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Integrante</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
