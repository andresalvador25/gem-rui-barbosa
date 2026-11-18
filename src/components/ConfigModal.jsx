import React, { useState } from 'react';
import { X, Settings, RotateCcw, AlertTriangle, Check, ArchiveRestore } from 'lucide-react';

export default function ConfigModal({ 
  isOpen, 
  onClose, 
  config = {}, 
  onSaveConfig, 
  onResetEmpty, 
  onRestoreBackup 
}) {
  const [localidade, setLocalidade] = useState(config.localidade || 'Vila Rui Barbosa');
  const [cidade, setCidade] = useState(config.cidade || 'Jundiaí - SP');
  const [quantidadeDesejada, setQuantidadeDesejada] = useState(config.quantidadeDesejada || 32);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      localidade: localidade.trim() || 'Vila Rui Barbosa',
      cidade: cidade.trim() || 'Jundiaí - SP',
      quantidadeDesejada: Number(quantidadeDesejada) || 32
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">Configurações do App</h2>
              <p className="text-xs text-slate-400">Congregação & Metas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nome da Congregação / Comum
              </label>
              <input
                type="text"
                value={localidade}
                onChange={e => setLocalidade(e.target.value)}
                placeholder="Ex: Vila Rui Barbosa"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cidade / Estado
              </label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: Jundiaí - SP"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Meta de Músicos da Orquestra (MOO)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={quantidadeDesejada}
                onChange={e => setQuantidadeDesejada(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </form>

          {/* Seção de Dados e Backup */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gerenciamento de Dados
            </h4>

            {/* Restaurar backup anterior do SAM */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-900">Restaurar 50 integrantes do SAM</p>
                <p className="text-[11px] text-blue-700">Recarrega a lista completa anterior</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja carregar a base com os 50 integrantes oficiais do SAM?')) {
                    onRestoreBackup();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Zerar Banco */}
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-900">Zerar Banco de Dados</p>
                <p className="text-[11px] text-red-700">Limpa todos os integrantes atuais</p>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Zerar</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetEmpty();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-800"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
