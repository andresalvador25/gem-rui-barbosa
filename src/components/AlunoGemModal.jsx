import React, { useState, useEffect } from 'react';
import { Save, CornerDownLeft, Info, Calendar, User, Music } from 'lucide-react';

export default function AlunoGemModal({ isOpen, onClose, onSave, onSaveSuccess, aluno = null, alunoToEdit = null }) {
  const alunoAlvo = aluno || alunoToEdit;

  const [formData, setFormData] = useState({
    nome: '',
    comum: 'VILA RUI BARBOSA',
    cargo: 'MÚSICO',
    nivel: 'CANDIDATO(A)',
    possuiInstrumento: 'SIM',
    instrumentoProprio: 'SIM',
    instrumento: 'VIOLINO',
    tonalidade: 'DÓ',
    dataInicioGem: new Date().toISOString().split('T')[0],
    batizado: 'SIM',
    telefone: '',
    observacoes: ''
  });

  useEffect(() => {
    if (alunoAlvo) {
      const instUpper = (alunoAlvo.instrumento || 'VIOLINO').toUpperCase();
      setFormData({
        id: alunoAlvo.id,
        nome: alunoAlvo.nome || '',
        comum: (alunoAlvo.comum || 'VILA RUI BARBOSA').toUpperCase(),
        cargo: (alunoAlvo.cargo || alunoAlvo.ministerio || (instUpper.includes('ÓRGÃO') ? 'ORGANISTA' : 'MÚSICO')).toUpperCase(),
        nivel: (alunoAlvo.nivel || 'CANDIDATO(A)').toUpperCase(),
        possuiInstrumento: (alunoAlvo.possuiInstrumento || 'SIM').toUpperCase(),
        instrumentoProprio: (alunoAlvo.instrumentoProprio || 'SIM').toUpperCase(),
        instrumento: instUpper === 'ÓRGÃO' ? 'ÓRGÃO ELETRÔNICO' : instUpper,
        tonalidade: alunoAlvo.tonalidade || 'DÓ',
        dataInicioGem: alunoAlvo.dataInicioGem || new Date().toISOString().split('T')[0],
        batizado: alunoAlvo.batizado === false || alunoAlvo.batizado === 'NÃO' ? 'NÃO' : 'SIM',
        telefone: alunoAlvo.telefone || alunoAlvo.contato || '',
        observacoes: alunoAlvo.observacoes || alunoAlvo.observacao || ''
      });
    } else {
      setFormData({
        nome: '',
        comum: 'VILA RUI BARBOSA',
        cargo: 'MÚSICO',
        nivel: 'CANDIDATO(A)',
        possuiInstrumento: 'SIM',
        instrumentoProprio: 'SIM',
        instrumento: 'VIOLINO',
        tonalidade: 'DÓ',
        dataInicioGem: new Date().toISOString().split('T')[0],
        batizado: 'SIM',
        telefone: '',
        observacoes: ''
      });
    }
  }, [alunoAlvo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    try {
      await fetch('/api/gem/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      window.dispatchEvent(new CustomEvent('gem-data-updated', { detail: formData }));
    } catch (err) {}
    if (onSave) onSave(formData);
    if (onSaveSuccess) onSaveSuccess(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full p-6 space-y-5">
        
        {/* Header Exato da Imagem: 'i Preencha os campos e clique em salvar. Campos com * são obrigatórios.' */}
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold border-b border-slate-100 pb-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Preencha os campos e clique em salvar. Campos com * são obrigatórios.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Nome * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Nome *
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                placeholder="Nome completo do aluno"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 uppercase"
              />
            </div>
          </div>

          {/* Comum Congregação * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Comum Congregação *
            </label>
            <div className="sm:col-span-3">
              <select
                value={formData.comum}
                onChange={e => setFormData({ ...formData, comum: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
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

          {/* Cargo/Ministério * e Nível * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Cargo/Ministério *
            </label>
            <div>
              <select
                value={formData.cargo}
                onChange={e => {
                  const novoCargo = e.target.value;
                  setFormData({
                    ...formData,
                    cargo: novoCargo,
                    instrumento: novoCargo === 'ORGANISTA' ? 'ÓRGÃO ELETRÔNICO' : (formData.instrumento.includes('ÓRGÃO') ? 'VIOLINO' : formData.instrumento)
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              >
                <option value="MÚSICO">MÚSICO</option>
                <option value="ORGANISTA">ORGANISTA</option>
              </select>
            </div>

            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Nível *
            </label>
            <div>
              <select
                value={formData.nivel === 'RJM OFICIALIZADO' ? 'RJM / OFICIALIZADO' : formData.nivel}
                onChange={e => setFormData({ ...formData, nivel: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
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
          </div>

          {/* Possui Instrumento? * e Instrumento Próprio? * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Possui Instrumento? *
            </label>
            <div>
              <select
                value={formData.possuiInstrumento}
                onChange={e => setFormData({ ...formData, possuiInstrumento: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>

            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Instrumento Próprio? *
            </label>
            <div>
              <select
                value={formData.instrumentoProprio}
                onChange={e => setFormData({ ...formData, instrumentoProprio: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>
          </div>

          {/* Instrumento que toca ou deseja tocar * e Tonalidade * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4 leading-tight">
              Instrumento que toca ou deseja tocar *
            </label>
            <div>
              <select
                value={formData.instrumento}
                onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600 uppercase"
              >
                <optgroup label="Cordas">
                  <option value="VIOLINO">VIOLINO</option>
                  <option value="VIOLA">VIOLA</option>
                  <option value="VIOLONCELO">VIOLONCELO</option>
                </optgroup>
                <optgroup label="Madeiras">
                  <option value="FLAUTA">FLAUTA</option>
                  <option value="OBOÉ">OBOÉ</option>
                  <option value="CLARINETE">CLARINETE</option>
                  <option value="CLARINETE ALTO">CLARINETE ALTO</option>
                  <option value="CLARINETE BAIXO">CLARINETE BAIXO</option>
                  <option value="SAXOFONE SOPRANO">SAXOFONE SOPRANO</option>
                  <option value="SAXOFONE ALTO">SAXOFONE ALTO</option>
                  <option value="SAXOFONE TENOR">SAXOFONE TENOR</option>
                  <option value="SAXOFONE BARÍTONO">SAXOFONE BARÍTONO</option>
                  <option value="FAGOTE">FAGOTE</option>
                  <option value="CORNE INGLÊS">CORNE INGLÊS</option>
                </optgroup>
                <optgroup label="Metais">
                  <option value="TROMPETE">TROMPETE</option>
                  <option value="CORNET">CORNET</option>
                  <option value="FLUGELHORN">FLUGELHORN</option>
                  <option value="TROMPA">TROMPA</option>
                  <option value="TROMBONITO">TROMBONITO</option>
                  <option value="TROMBONE">TROMBONE</option>
                  <option value="EUFÔNIO">EUFÔNIO</option>
                  <option value="BARÍTONO SIb">BARÍTONO SIb</option>
                  <option value="TUBA">TUBA</option>
                </optgroup>
                <optgroup label="Teclas">
                  <option value="ÓRGÃO ELETRÔNICO">ÓRGÃO ELETRÔNICO</option>
                </optgroup>
              </select>
            </div>

            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Tonalidade *
            </label>
            <div>
              <select
                value={formData.tonalidade}
                onChange={e => setFormData({ ...formData, tonalidade: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              >
                <option value="DÓ">DÓ</option>
                <option value="SIb">SIb</option>
                <option value="MIb">MIb</option>
                <option value="FÁ">FÁ</option>
              </select>
            </div>
          </div>

          {/* Batizado(a) * e Telefone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Batizado(a)? *
            </label>
            <div>
              <select
                value={formData.batizado}
                onChange={e => setFormData({ ...formData, batizado: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              >
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>

            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Telefone / WhatsApp
            </label>
            <div>
              <input
                type="text"
                value={formData.telefone}
                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Data Inicio GEM e Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Data Inicio GEM
            </label>
            <div>
              <input
                type="date"
                value={formData.dataInicioGem}
                onChange={e => setFormData({ ...formData, dataInicioGem: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              />
            </div>

            <label className="font-bold text-slate-700 text-right sm:pr-4">
              Observações
            </label>
            <div>
              <input
                type="text"
                value={formData.observacoes}
                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Botões Inferiores Exatos: Salvar (Azul) e Voltar (Branco) */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold px-5 py-2 rounded-lg transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg transition"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
