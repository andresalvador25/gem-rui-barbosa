import React, { useState, useEffect } from 'react';
import { X, Printer, Edit2, Check, Sparkles, Filter, Calculator } from 'lucide-react';

export default function RelacaoTable({ integrantes = [], onSelectFilter, onClose, isModal = false }) {
  // Aprendizes GEM configurável
  const [aprendizesGem, setAprendizesGem] = useState(() => {
    const saved = localStorage.getItem('relacao_aprendizes_gem');
    return saved !== null ? parseInt(saved) || 18 : 18;
  });
  const [editandoGem, setEditandoGem] = useState(false);

  const salvarGem = (valor) => {
    const num = Math.max(0, parseInt(valor) || 0);
    setAprendizesGem(num);
    localStorage.setItem('relacao_aprendizes_gem', num.toString());
  };

  // Cálculos automáticos a partir do banco de dados real
  const musicos = integrantes.filter(i => i.categoria === 'Músico');
  const organistas = integrantes.filter(i => i.categoria === 'Organista');

  const totalMusicos = musicos.length;
  const musicosOfic = musicos.filter(i => i.oficializado).length;
  const musicosNaoOfic = musicos.filter(i => !i.oficializado).length;
  const musicosCultos = musicos.filter(i => i.cultosOficiais).length;
  const musicosRjm = musicos.filter(i => i.rjm).length;
  const musicosEnsaios = musicos.filter(i => i.ensaios).length;

  const totalComAprendizes = totalMusicos + aprendizesGem;

  const totalOrganistas = organistas.length;
  const organistasOfic = organistas.filter(i => i.oficializado).length;
  const organistasNaoOfic = organistas.filter(i => !i.oficializado).length;
  const organistasCultos = organistas.filter(i => i.cultosOficiais).length;
  const organistasMeiaHora = organistas.filter(i => i.meiaHora).length;
  const organistasRjmEnsaios = organistas.filter(i => i.rjm || i.ensaios).length;

  const totalGeral = totalMusicos + totalOrganistas;

  const pct = (val, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  };

  const handleRowClick = (filterType) => {
    if (onSelectFilter) {
      onSelectFilter(filterType);
      if (onClose) onClose();
    }
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden max-w-md w-full font-sans animate-fadeIn">
      {/* Cabeçalho estilo Excel original: Cyan / Azul */}
      <div className="bg-[#00b0f0] text-black font-black text-center py-2.5 px-4 tracking-wider text-base border-b-2 border-black flex items-center justify-between">
        <span className="flex-1 text-center font-extrabold uppercase text-slate-900 tracking-wide text-sm sm:text-base">
          RELAÇÃO
        </span>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/10 transition text-slate-900"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabela Idêntica à Planilha */}
      <div className="overflow-x-auto text-xs sm:text-sm">
        <table className="w-full border-collapse border border-slate-300">
          <tbody>
            {/* SEÇÃO 1: MÚSICOS */}
            <tr 
              onClick={() => handleRowClick('musicos_ofic')}
              className="border-b border-slate-300 hover:bg-emerald-50/50 cursor-pointer transition"
              title="Clique para filtrar apenas Músicos Oficializados"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Músicos Ofic. :
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300 w-24">
                {musicosOfic}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700 w-24">
                {pct(musicosOfic, totalMusicos)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('musicos_nao_ofic')}
              className="border-b border-slate-300 hover:bg-emerald-50/50 cursor-pointer transition"
              title="Clique para filtrar apenas Músicos Não Oficializados"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Músicos Não Ofic.
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {musicosNaoOfic}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(musicosNaoOfic, totalMusicos)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('musicos_cultos')}
              className="border-b border-slate-300 hover:bg-emerald-50/50 cursor-pointer transition"
              title="Clique para filtrar quem toca em Cultos Oficiais"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Cultos Oficiais
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {musicosCultos}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(musicosCultos, totalMusicos)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('musicos_rjm')}
              className="border-b border-slate-300 hover:bg-emerald-50/50 cursor-pointer transition"
              title="Clique para filtrar quem toca na RJM"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                RJM
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {musicosRjm}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(musicosRjm, totalMusicos)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('musicos_ensaios')}
              className="border-b border-slate-300 hover:bg-emerald-50/50 cursor-pointer transition"
              title="Clique para filtrar quem toca nos Ensaios"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Ensaios
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {musicosEnsaios}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                —
              </td>
            </tr>

            {/* Linha Aprendizes GEM com edição */}
            <tr className="border-b-2 border-slate-400 bg-slate-50/60">
              <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-300 flex items-center justify-between">
                <span>Aprendizes GEM</span>
                {!editandoGem ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditandoGem(true); }}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 ml-2"
                    title="Editar quantidade de aprendizes GEM"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditandoGem(false); }}
                    className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 ml-2"
                  >
                    <Check className="w-3 h-3" /> OK
                  </button>
                )}
              </td>
              <td className="py-2 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {editandoGem ? (
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={aprendizesGem}
                    onChange={(e) => salvarGem(e.target.value)}
                    className="w-16 text-center font-bold border-2 border-blue-500 rounded bg-white text-slate-900 text-sm py-0.5 outline-none"
                    autoFocus
                  />
                ) : (
                  <span>{aprendizesGem}</span>
                )}
              </td>
              <td className="py-2 px-3 text-right font-extrabold text-slate-800 text-xs">
                100% Rui Barbosa
              </td>
            </tr>

            {/* Linha Separadora Vazia */}
            <tr className="h-2 bg-slate-100/50 border-b border-slate-300">
              <td colSpan={3}></td>
            </tr>

            {/* TOTAL Músicos (Vermelho como no original) */}
            <tr 
              onClick={() => handleRowClick('musicos_todos')}
              className="border-b border-slate-300 bg-red-50/20 hover:bg-red-50/50 cursor-pointer transition"
              title="Clique para filtrar todos os Músicos"
            >
              <td className="py-2 px-3 font-black text-red-600 uppercase border-r border-slate-300 text-sm">
                TOTAL Músicos
              </td>
              <td className="py-2 px-3 text-right font-black text-red-600 text-base border-r border-slate-300">
                {totalMusicos}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-700">
                —
              </td>
            </tr>

            {/* TOTAL + Aprendizes (Vermelho como no original) */}
            <tr className="border-b-2 border-slate-400 bg-red-50/30">
              <td className="py-2 px-3 font-black text-red-600 uppercase border-r border-slate-300 text-sm">
                TOTAL + Aprendizes
              </td>
              <td className="py-2 px-3 text-right font-black text-red-600 text-base border-r border-slate-300">
                {totalComAprendizes}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-500 text-xs">
                {totalMusicos} + {aprendizesGem} GEM
              </td>
            </tr>

            {/* Linha Separadora Vazia */}
            <tr className="h-3 bg-slate-100 border-b-2 border-slate-400">
              <td colSpan={3}></td>
            </tr>

            {/* SEÇÃO 2: ORGANISTAS */}
            <tr 
              onClick={() => handleRowClick('organistas_ofic')}
              className="border-b border-slate-300 hover:bg-purple-50/50 cursor-pointer transition"
              title="Clique para filtrar apenas Organistas Oficializadas"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Organistas Ofic.
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {organistasOfic}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(organistasOfic, totalOrganistas)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('organistas_nao_ofic')}
              className="border-b border-slate-300 hover:bg-purple-50/50 cursor-pointer transition"
              title="Clique para filtrar Organistas Não Oficializadas"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Organistas Não Ofic.
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {organistasNaoOfic}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(organistasNaoOfic, totalOrganistas)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('organistas_cultos')}
              className="border-b border-slate-300 hover:bg-purple-50/50 cursor-pointer transition"
              title="Clique para filtrar Organistas de Cultos Oficiais"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Cultos Oficiais
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {organistasCultos}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(organistasCultos, totalOrganistas)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('organistas_meia_hora')}
              className="border-b border-slate-300 hover:bg-purple-50/50 cursor-pointer transition"
              title="Clique para filtrar Organistas que tocam Meia Hora"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                Meia Hora
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {organistasMeiaHora}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(organistasMeiaHora, totalOrganistas)}
              </td>
            </tr>

            <tr 
              onClick={() => handleRowClick('organistas_rjm')}
              className="border-b border-slate-300 hover:bg-purple-50/50 cursor-pointer transition"
              title="Clique para filtrar Organistas de RJM e Ensaios"
            >
              <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                RJM e Ensaios
              </td>
              <td className="py-1.5 px-3 text-right font-black text-[#00b050] text-base border-r border-slate-300">
                {organistasRjmEnsaios}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-700">
                {pct(organistasRjmEnsaios, totalOrganistas)}
              </td>
            </tr>

            {/* Linha Separadora Vazia */}
            <tr className="h-2 bg-slate-100/50 border-b border-slate-300">
              <td colSpan={3}></td>
            </tr>

            {/* TOTAL Organistas (Vermelho como no original) */}
            <tr 
              onClick={() => handleRowClick('organistas_todas')}
              className="border-b-2 border-slate-400 bg-red-50/20 hover:bg-red-50/50 cursor-pointer transition"
              title="Clique para filtrar todas as Organistas"
            >
              <td className="py-2 px-3 font-black text-red-600 uppercase border-r border-slate-300 text-sm">
                TOTAL Organistas
              </td>
              <td className="py-2 px-3 text-right font-black text-red-600 text-base border-r border-slate-300">
                {totalOrganistas}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-700">
                —
              </td>
            </tr>

            {/* Linha Separadora Vazia */}
            <tr className="h-3 bg-slate-100 border-b-2 border-slate-400">
              <td colSpan={3}></td>
            </tr>

            {/* TOTAL GERAL (Mus. + Org.) */}
            <tr 
              onClick={() => handleRowClick('todos')}
              className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
              title="Clique para ver todos os integrantes"
            >
              <td className="py-2.5 px-3 font-black text-slate-900 uppercase border-r border-slate-300 text-sm">
                TOTAL (Mus. + Org.)
              </td>
              <td className="py-2.5 px-3 text-right font-black text-red-600 text-lg border-r border-slate-300">
                {totalGeral}
              </td>
              <td className="py-2.5 px-3 text-right font-black text-slate-900 text-base">
                100,00%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
        💡 <em>Dica: Clique em qualquer linha para filtrar a tabela de integrantes</em>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        {content}
      </div>
    );
  }

  return content;
}
