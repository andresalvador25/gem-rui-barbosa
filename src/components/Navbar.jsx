import React from 'react';
import { Music, Printer, ExternalLink, RefreshCw } from 'lucide-react';

export default function Navbar({ config, onPrint, onRefresh, loading, onOpenSamModal }) {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Locality */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-inner">
            <Music className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                SAM MUSICAL
              </span>
              <span className="bg-blue-800/80 text-blue-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-700">
                CCB
              </span>
            </div>
            <p className="text-xs text-blue-200/80 flex items-center gap-1.5 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {config?.localidade || 'Vila Rui Barbosa'} • {config?.cidade || 'Jundiaí - SP'}
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3">
          {/* SAM Status Pill */}
          <button
            onClick={onOpenSamModal}
            title="Ver status de sincronização e importar do SAM"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SAM: <strong>32 Ofic. / 50 Total</strong></span>
          </button>

          <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-blue-200 mr-1.5 font-medium">Meta MOO:</span>
            <span className="font-bold text-white bg-blue-600 px-2 py-0.5 rounded text-[11px]">
              {config?.quantidadeDesejada || 32} músicos ({config?.tipoOrquestra || 'Simples'})
            </span>
          </div>

          <button
            onClick={onPrint}
            title="Imprimir relatório da página atual"
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Atualizar dados"
            className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSamModal}
            title="Gerenciar Integração SAM"
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Sincronizar SAM</span>
          </button>
        </div>

      </div>
    </header>
  );
}
