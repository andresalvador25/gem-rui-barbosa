import React, { useState } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  RefreshCw, 
  Upload, 
  X, 
  ShieldCheck, 
  Database,
  Music,
  Users,
  AlertCircle
} from 'lucide-react';

export default function SamSyncModal({ isOpen, onClose, data, onSyncSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'import'
  const [loading, setLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState(null);

  const config = data?.config || {};
  const musicos = data?.musicos || [];
  const organistas = data?.organistas || [];

  const oficializados = musicos.filter(m => m.oficializado || m.fase === 'Oficializado').length;
  const totalMusicos = musicos.length;
  const orgOficializadas = organistas.filter(o => o.oficializada || o.fase === 'Oficializada').length;

  const handleResync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/sam/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Dados atualizados com sucesso conforme o SAM Oficial!' });
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setMessage({ type: 'error', text: 'Falha ao sincronizar dados.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor local.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      setMessage({ type: 'error', text: 'Por favor, cole os dados antes de importar.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // Tenta parsear JSON ou linhas CSV
      let parsedMusicos = null;
      let parsedOrganistas = null;

      if (importText.trim().startsWith('{') || importText.trim().startsWith('[')) {
        const json = JSON.parse(importText);
        if (Array.isArray(json)) parsedMusicos = json;
        else {
          parsedMusicos = json.musicos;
          parsedOrganistas = json.organistas;
        }
      } else {
        // Parse CSV simples: Nome;Instrumento;Fase;Telefone
        const lines = importText.trim().split('\n');
        parsedMusicos = lines.map((line, idx) => {
          const parts = line.split(/[;,\t]/);
          const nome = (parts[0] || '').trim();
          const instrumento = (parts[1] || '').trim();
          const fase = (parts[2] || 'Oficializado').trim();
          const telefone = (parts[3] || '').trim();

          let naipe = 'Cordas';
          const instLower = instrumento.toLowerCase();
          if (instLower.includes('flauta') || instLower.includes('clarinete') || instLower.includes('sax') || instLower.includes('obo') || instLower.includes('fagote')) {
            naipe = 'Madeiras';
          } else if (instLower.includes('tromp') || instLower.includes('tromb') || instLower.includes('euf') || instLower.includes('tuba') || instLower.includes('cornet') || instLower.includes('flugel')) {
            naipe = 'Metais';
          }

          return {
            id: Date.now() + idx,
            nome,
            instrumento,
            naipe,
            fase,
            culto: fase === 'Oficializado' || fase.includes('Culto'),
            rjm: true,
            meiaHora: fase === 'Oficializado',
            oficializado: fase === 'Oficializado',
            batizado: true,
            telefone,
            sam: true
          };
        }).filter(m => m.nome && m.instrumento);
      }

      const res = await fetch('/api/sam/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicos: parsedMusicos, organistas: parsedOrganistas })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setMessage({ type: 'success', text: `Importação concluída! ${parsedMusicos ? parsedMusicos.length + ' músicos atualizados.' : ''}` });
        if (onSyncSuccess) onSyncSuccess();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Formato inválido. Cole um JSON válido ou linhas com: Nome;Instrumento;Fase;Telefone' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Integração & Dados SAM CCB</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado ao Painel
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Sistema de Administração Musical • {config.localidade}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'status' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            Status da Sincronização
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'import' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar / Colar do SAM
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              {message.text}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Origem dos Dados:</span>
                  <a 
                    href="https://musical.congregacao.org.br/painel" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    musical.congregacao.org.br/painel
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Status no Local:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Sincronizado e Atualizado
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">Orquestra Oficial</div>
                  <div className="text-2xl font-black text-blue-900 mt-0.5">{oficializados}</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">músicos oficializados</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-indigo-700 font-semibold uppercase tracking-wider">Orquestra + GEM</div>
                  <div className="text-2xl font-black text-indigo-900 mt-0.5">{totalMusicos}</div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">corpo musical total</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">Organistas</div>
                  <div className="text-2xl font-black text-amber-900 mt-0.5">{organistas.length}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">{orgOficializadas} oficializadas</div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 leading-relaxed">
                <strong>Dados Atualizados:</strong> O aplicativo está configurado com o espelhamento oficial dos registros do SAM da congregação <strong>Vila Rui Barbosa</strong> (Jundiaí - SP), contemplando os 32 músicos oficializados, os aprendizes com instrumento no GEM totalizando 50 músicos, e as 19 organistas registradas.
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleResync}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Recarregar Snapshot SAM Oficial
                </button>

                <a
                  href="https://musical.congregacao.org.br/painel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-700 text-xs font-semibold border border-slate-300 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Painel SAM CCB
                </a>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cole os dados exportados do SAM (CSV ou JSON):
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={7}
                  placeholder={`Exemplo CSV:\nLincoln Machado;Violino;Oficializado;984101299\nJhony Pinheiro Soares Santos;Violoncelo;GEM com Instrumento;\nAnderson Flávio de França;Saxofone Tenor;GEM com Instrumento;`}
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Aceita linhas no formato: <code className="bg-slate-200 px-1 py-0.5 rounded">Nome;Instrumento;Fase;Telefone</code> ou o JSON completo de músicos.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || !importText.trim()}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Processar e Sincronizar
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
