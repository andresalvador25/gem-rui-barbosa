import React, { useState } from 'react';
import { Settings, Save, RefreshCcw, Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ConfigView({ config, onSaveConfig, onResetData }) {
  const [formData, setFormData] = useState({
    localidade: config?.localidade || 'Vila Rui Barbosa',
    cidade: config?.cidade || 'Jundiaí - SP',
    regional: config?.regional || 'Vila Rui Barbosa | BR-SP-JUNDIAÍ-JUNDIAÍ',
    quantidadeDesejada: config?.quantidadeDesejada || 32,
    tipoOrquestra: config?.tipoOrquestra || 'Simples',
    cultosSemana: config?.cultosSemana || 2,
    temRjm: config?.temRjm !== undefined ? config.temRjm : true,
    idealOrganistasRjm: config?.idealOrganistasRjm || 3,
    idealOrganistasCulto: config?.idealOrganistasCulto || 6
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleDownloadBackup = () => {
    fetch('/api/all')
      .then(res => res.json())
      .then(data => {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute('download', `backup_sam_musical_${formData.localidade.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
  };

  return (
    <div className="space-y-6 max-w-4xl">

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>Configurações da Localidade & Dados</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalize os parâmetros de cálculo da orquestra, número de cultos e gerencie backups.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Localidade / Casa de Oração</label>
              <input
                type="text"
                value={formData.localidade}
                onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cidade / Regional</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo Padrão de Orquestra</label>
              <select
                value={formData.tipoOrquestra}
                onChange={(e) => setFormData({ ...formData, tipoOrquestra: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-semibold cursor-pointer"
              >
                <option value="Simples">Orquestra Simples</option>
                <option value="Completa">Orquestra Completa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantidade Desejada de Músicos</label>
              <input
                type="number"
                step="4"
                min="4"
                max="100"
                value={formData.quantidadeDesejada}
                onChange={(e) => setFormData({ ...formData, quantidadeDesejada: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cultos Oficiais por Semana</label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.cultosSemana}
                onChange={(e) => setFormData({ ...formData, cultosSemana: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Organistas Ideais para Cultos Oficiais</label>
              <input
                type="number"
                value={formData.idealOrganistasCulto}
                onChange={(e) => setFormData({ ...formData, idealOrganistasCulto: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Organistas Ideais para RJM</label>
              <input
                type="number"
                value={formData.idealOrganistasRjm}
                onChange={(e) => setFormData({ ...formData, idealOrganistasRjm: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Backup e Restauração de Dados</h2>
        <p className="text-xs text-slate-500">
          Você pode fazer download do arquivo completo de dados do SAM em formato JSON para salvar no seu computador ou transferir de máquina.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Fazer Backup dos Dados (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Atenção: deseja restaurar os dados originais fornecidos pela planilha de Vila Rui Barbosa?")) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg text-xs font-bold transition"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Restaurar Dados Originais</span>
          </button>
        </div>
      </div>

    </div>
  );
}
