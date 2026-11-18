import React, { useState } from 'react';
import { 
  Calendar, 
  Award, 
  BookOpen, 
  Music, 
  Trash2, 
  Edit2, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileText,
  Plus
} from 'lucide-react';

export default function HistoricoAlunoView({ 
  historico = [], 
  onAddClick, 
  onEditClick, 
  onDeleteClick,
  readOnly = false,
  canDelete = true
}) {
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const tipos = ['Todos', 'MSA', 'MTS', 'Prova', 'Método', 'Hinário', 'Escalas'];

  const filtrados = historico.filter(item => {
    if (filtroTipo === 'Todos') return true;
    return item.tipo === filtroTipo;
  });

  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'Prova':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'MSA':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MTS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Método':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Hinário':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Escalas':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Barra de Filtros e Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs no-print">
        {/* Pílulas de filtro por tipo de atividade */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {tipos.map(t => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition ${
                filtroTipo === t
                  ? 'bg-[#0f4c81] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {!readOnly && onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#0f4c81] hover:bg-[#0c3c66] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Atividade</span>
          </button>
        )}
      </div>

      {filtroTipo !== 'Todos' && (
        <div className="print-only text-[11px] font-bold text-slate-600 mb-1">
          Filtro aplicado: {filtroTipo}
        </div>
      )}

      {/* Lista / Timeline do Histórico */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2 card-print">
          <Clock className="w-8 h-8 text-slate-300 mx-auto no-print" />
          <h4 className="font-bold text-slate-700 text-sm">Nenhum registro encontrado</h4>
          <p className="text-xs text-slate-400">
            {filtroTipo === 'Todos'
              ? 'Nenhuma atividade ou avaliação lançada para este aluno ainda. Use o botão "Lançar Atividade" acima para adicionar.'
              : `Nenhuma atividade do tipo "${filtroTipo}" lançada.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 print:space-y-2">
          {filtrados.map(item => {
            const dataFmt = item.data ? item.data.split('-').reverse().join('/') : '-';

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition space-y-2.5 card-print print-avoid-break print:p-3"
              >
                {/* Linha 1: Data, Tipo Badge, Nota (se houver), Ações */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getBadgeStyle(item.tipo)}`}>
                      {item.tipo}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dataFmt}
                    </span>
                    {item.tipo === 'Prova' && item.nota && (
                      <span className="bg-purple-600 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-xs">
                        Nota: {item.nota}
                      </span>
                    )}
                  </div>

                  {/* Botões Editar / Excluir */}
                  {!readOnly && (
                    <div className="flex items-center gap-1 no-print">
                      {onEditClick && (
                        <button
                          onClick={() => onEditClick(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition rounded"
                          title="Editar lançamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && onDeleteClick && (
                        <button
                          onClick={() => onDeleteClick(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Linha 2: Detalhes específicos do tipo de atividade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print-grid-3 gap-2 text-xs">
                  {/* MSA / MTS / Prova */}
                  {(item.faseDe || item.faseAte) && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Fase / Módulo</span>
                      <span className="font-bold text-slate-800">
                        {item.faseDe === item.faseAte ? item.faseDe : `${item.faseDe} até ${item.faseAte}`}
                      </span>
                    </div>
                  )}

                  {/* Páginas e Lições */}
                  {(item.paginaDe || item.licaoDe) && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Páginas & Lições</span>
                      <span className="font-bold text-slate-800">
                        {item.paginaDe && `Pág. ${item.paginaDe}${item.paginaAte ? ' a ' + item.paginaAte : ''}`}
                        {item.paginaDe && item.licaoDe && ' • '}
                        {item.licaoDe && `Lição ${item.licaoDe}${item.licaoAte ? ' a ' + item.licaoAte : ''}`}
                      </span>
                    </div>
                  )}

                  {/* Claves */}
                  {item.claves && item.claves.length > 0 && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Clave</span>
                      <span className="font-bold text-slate-800">{item.claves.join(', ')}</span>
                    </div>
                  )}

                  {/* Método */}
                  {item.metodo && item.tipo !== 'Prova' && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Método</span>
                      <span className="font-bold text-slate-800">{item.metodo}</span>
                    </div>
                  )}

                  {/* Hinário */}
                  {item.hino && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Hino & Voz</span>
                      <span className="font-bold text-cyan-800">{item.hino}</span>
                    </div>
                  )}

                  {/* Escalas */}
                  {item.tonalidadeEscala && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase">Escala</span>
                      <span className="font-bold text-amber-800">{item.tonalidadeEscala}</span>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {item.observacoes && (
                  <div className="text-xs text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 italic">
                    "{item.observacoes}"
                  </div>
                )}

                {/* Autorizado por */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Autorizado por: <strong className="text-slate-600 font-semibold">{item.autorizadoPor || 'Instrutor'}</strong></span>
                  <span className="text-[10px]">ID: #{item.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
