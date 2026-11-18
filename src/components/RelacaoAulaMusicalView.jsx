import React, { useState } from 'react';
import { 
  Music2, 
  BarChart3, 
  Layers, 
  Check, 
  Edit3, 
  RotateCcw, 
  Scale, 
  Sparkles,
  Info,
  Printer
} from 'lucide-react';
import { RELACAO_AULA_MUSICAL_DATA } from '../constants/gemInitialData.js';

export default function RelacaoAulaMusicalView() {
  const [dados, setDados] = useState(() => {
    const saved = localStorage.getItem('gem_relacao_aula_musical');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return RELACAO_AULA_MUSICAL_DATA;
  });

  const [modoEdicao, setModoEdicao] = useState(false);

  const salvarStorage = (novosDados) => {
    setDados(novosDados);
    localStorage.setItem('gem_relacao_aula_musical', JSON.stringify(novosDados));
    setModoEdicao(false);
  };

  const restaurarPadrao = () => {
    salvarStorage(RELACAO_AULA_MUSICAL_DATA);
  };

  const handleMtsChange = (idx, valor) => {
    const val = Math.max(0, parseInt(valor) || 0);
    const modulos = [...dados.modulosMts];
    modulos[idx].qtd = val;
    setDados({ ...dados, modulosMts: modulos });
  };

  const handleInstChange = (idx, campo, valor) => {
    const val = Math.max(0, parseInt(valor) || 0);
    const insts = [...dados.instrumentos];
    insts[idx][campo] = val;
    setDados({ ...dados, instrumentos: insts });
  };

  // Totais calculados
  const totalMts = dados.modulosMts.reduce((a, b) => a + (b.qtd || 0), 0);
  const totalGeralInst = dados.instrumentos.reduce((a, b) => a + (b.geral || 0), 0);
  const totalRuiBarbosaInst = dados.instrumentos.reduce((a, b) => a + (b.ruiBarbosa || 0), 0);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Cabeçalho Exclusivo de Impressão */}
      <div className="print-only border-b-2 border-slate-900 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Congregação Cristã no Brasil • Vila Rui Barbosa — Jundiaí - SP
            </p>
            <h1 className="text-base font-black uppercase text-slate-900">
              Relação Aula Musical — GEM
            </h1>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <span className="block font-bold">
              MTS/MSA: {totalMts} • GEM Geral: {totalGeralInst} • Rui Barbosa: {totalRuiBarbosaInst}
            </span>
            <span>Emitido em: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Banner Superior Relação Aula Musical */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/40 border border-blue-400/30 text-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Planilha Oficial GEM • Vila Rui Barbosa
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
              <Music2 className="w-5 h-5 text-blue-400" />
              Relação Aula Musical — GEM
            </h2>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Comparativo de Alunos por Módulo MTS, Instrumentos (Geral vs Rui Barbosa) e Famílias de Naipes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!modoEdicao ? (
              <button
                onClick={() => setModoEdicao(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Valores</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => salvarStorage(dados)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={restaurarPadrao}
                  className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar</span>
                </button>
              </div>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition"
              title="Imprimir relação aula musical"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-blue-800/60 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-blue-300 font-semibold block text-[11px]">Total Alunos MTS/MSA</span>
            <span className="text-xl font-black text-white">{totalMts}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-indigo-300 font-semibold block text-[11px]">Alunos GEM Geral</span>
            <span className="text-xl font-black text-indigo-300">{totalGeralInst}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 font-semibold block text-[11px]">GEM Rui Barbosa</span>
            <span className="text-xl font-black text-emerald-300">{totalRuiBarbosaInst}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <span className="text-amber-300 font-semibold block text-[11px]">Outras Congregações</span>
            <span className="text-xl font-black text-amber-300">{Math.max(0, totalGeralInst - totalRuiBarbosaInst)}</span>
          </div>
        </div>
      </div>

      {/* GRID DE TABELAS DA RELAÇÃO DA AULA MUSICAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 print-relacao-grid gap-4 items-start">
        {/* COLUNA 1: ALUNOS POR MÓDULO MTS (3 COLUNAS NO GRID) */}
        <div className="lg:col-span-3 border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white card-print print-avoid-break">
          <div className="bg-slate-800 text-white px-3 py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-between">
            <span>ALUNOS POR MÓDULO MTS</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
              Total: {totalMts}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                  <th className="py-1 px-3 border-r border-slate-200">FASE / MÓDULO</th>
                  <th className="py-1 px-3 text-center w-20">ALUNOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dados.modulosMts.map((item, idx) => (
                  <tr key={item.fase} className={`hover:bg-blue-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <td className="py-1 px-3 font-bold text-slate-800 border-r border-slate-200">
                      {item.fase}
                    </td>
                    <td className="py-1 px-3 text-center font-black text-slate-900 text-sm">
                      {modoEdicao ? (
                        <input
                          type="number"
                          min="0"
                          value={item.qtd}
                          onChange={e => handleMtsChange(idx, e.target.value)}
                          className="w-12 text-center py-0.5 border border-blue-500 rounded font-bold text-blue-900 bg-blue-50"
                        />
                      ) : (
                        item.qtd
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-1.5 px-3">TOTAL</td>
                  <td className="py-1.5 px-3 text-center text-sm text-blue-800">{totalMts}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* COLUNA 2: INSTRUMENTOS GERAL vs RUI BARBOSA (5 COLUNAS NO GRID) */}
        <div className="lg:col-span-5 border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white card-print print-avoid-break">
          <div className="bg-[#41719c] text-white px-3 py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-between">
            <span>INSTRUMENTOS DO GEM</span>
            <span className="text-[11px] text-blue-100">Geral ({totalGeralInst}) vs Rui Barbosa ({totalRuiBarbosaInst})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                  <th className="py-1 px-3 border-r border-slate-200">INSTRUMENTO</th>
                  <th className="py-1 px-2.5 text-center border-r border-slate-200 w-20">GEM GERAL</th>
                  <th className="py-1 px-2.5 text-center w-24">RUI BARBOSA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dados.instrumentos.map((item, idx) => (
                  <tr key={item.nome} className={`hover:bg-blue-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <td className="py-1 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {item.nome}
                    </td>
                    <td className="py-1 px-2.5 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      {modoEdicao ? (
                        <input
                          type="number"
                          min="0"
                          value={item.geral}
                          onChange={e => handleInstChange(idx, 'geral', e.target.value)}
                          className="w-12 text-center py-0.5 border border-blue-500 rounded font-bold text-blue-900 bg-blue-50"
                        />
                      ) : (
                        item.geral
                      )}
                    </td>
                    <td className="py-1 px-2.5 text-center font-black text-blue-700 text-sm">
                      {modoEdicao ? (
                        <input
                          type="number"
                          min="0"
                          value={item.ruiBarbosa}
                          onChange={e => handleInstChange(idx, 'ruiBarbosa', e.target.value)}
                          className="w-12 text-center py-0.5 border border-blue-500 rounded font-bold text-blue-900 bg-blue-50"
                        />
                      ) : (
                        item.ruiBarbosa
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="py-1.5 px-3">TOTAL INSTRUMENTOS</td>
                  <td className="py-1.5 px-2.5 text-center text-sm font-black">{totalGeralInst}</td>
                  <td className="py-1.5 px-2.5 text-center text-sm font-black text-blue-800">{totalRuiBarbosaInst}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* COLUNA 3: FAMÍLIAS DE NAIPES (4 COLUNAS NO GRID) */}
        <div className="lg:col-span-4 space-y-4">
          {/* TABELA GEM GERAL */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white card-print print-avoid-break">
            <div className="bg-[#5b9bd5] text-white px-3 py-2 font-black text-xs uppercase tracking-wider flex items-center justify-between">
              <span>FAMÍLIAS — GEM GERAL</span>
              <span className="text-[11px] bg-white/20 px-2 py-0.2 rounded">Total: 27</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                    <th className="py-1 px-2.5 border-r border-slate-200">FAMÍLIA</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">QTDE</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">REC</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">%</th>
                    <th className="py-1 px-1.5 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.familiasGeral.map((f, i) => (
                    <tr key={f.familia} className="hover:bg-slate-50 transition">
                      <td className="py-1 px-2.5 font-bold text-slate-800 border-r border-slate-200">{f.familia}</td>
                      <td className="py-1 px-1.5 text-center font-black text-slate-900 border-r border-slate-200">{f.qtde}</td>
                      <td className="py-1 px-1.5 text-center font-bold text-slate-500 border-r border-slate-200">{f.rec}</td>
                      <td className="py-1 px-1.5 text-center font-semibold text-slate-600 border-r border-slate-200">{f.pctQtde}%</td>
                      <td className="py-1 px-1.5 text-center font-black">
                        <span className={`px-2 py-0.2 rounded text-[10px] ${
                          f.status === '+' ? 'bg-blue-100 text-blue-800' :
                          f.status === '-' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td className="py-1 px-2.5">TOTAL</td>
                    <td className="py-1 px-1.5 text-center">27</td>
                    <td className="py-1 px-1.5 text-center">27</td>
                    <td className="py-1 px-1.5 text-center">100%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TABELA GEM RUI BARBOSA */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white card-print print-avoid-break">
            <div className="bg-[#2e75b6] text-white px-3 py-2 font-black text-xs uppercase tracking-wider flex items-center justify-between">
              <span>FAMÍLIAS — GEM RUI BARBOSA</span>
              <span className="text-[11px] bg-white/20 px-2 py-0.2 rounded">Total: 24</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                    <th className="py-1 px-2.5 border-r border-slate-200">FAMÍLIA</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">QTDE</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">REC</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-200">%</th>
                    <th className="py-1 px-1.5 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dados.familiasRuiBarbosa.map((f, i) => (
                    <tr key={f.familia} className="hover:bg-slate-50 transition">
                      <td className="py-1 px-2.5 font-bold text-slate-800 border-r border-slate-200">{f.familia}</td>
                      <td className="py-1 px-1.5 text-center font-black text-slate-900 border-r border-slate-200">{f.qtde}</td>
                      <td className="py-1 px-1.5 text-center font-bold text-slate-500 border-r border-slate-200">{f.rec}</td>
                      <td className="py-1 px-1.5 text-center font-semibold text-slate-600 border-r border-slate-200">{f.pctQtde}%</td>
                      <td className="py-1 px-1.5 text-center font-black">
                        <span className={`px-2 py-0.2 rounded text-[10px] ${
                          f.status === 'OK' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                          f.status === '+' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td className="py-1 px-2.5">TOTAL</td>
                    <td className="py-1 px-1.5 text-center">24</td>
                    <td className="py-1 px-1.5 text-center">24</td>
                    <td className="py-1 px-1.5 text-center">100%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
