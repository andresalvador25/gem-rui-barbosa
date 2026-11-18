import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Scale, 
  Edit3, 
  Check, 
  RotateCcw, 
  Sparkles,
  Info,
  Sliders,
  Columns2,
  TableProperties,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { TAMANHOS_PADRAO_MOO, GRADE_OFICIAL_MOO, gerarGradePadraoMoo } from '../constants/mooStandard.js';
import ComboChartExcel from './ComboChartExcel.jsx';
import RelacaoTable from './RelacaoTable.jsx';
import TabelaRecomendacaoExcel from './TabelaRecomendacaoExcel.jsx';
import { isMatchInstrumento } from '../utils/instrumentMatcher.js';

export default function MooView({ integrantes = [], alunosGem = [], readOnly = false }) {
  const [subModo, setSubModo] = useState('oficializados'); // 'oficializados' ou 'com_gem'
  const [viewModoTabelas, setViewModoTabelas] = useState('modelo_cores'); // 'modelo_cores', 'lado_a_lado', 'consolidada', 'relacao'
  const [metaTamanho, setMetaTamanho] = useState(32); // tamanho da orquestra (ex: 28, 32, 36, 40, 50...)
  const [modoEdicaoIndividual, setModoEdicaoIndividual] = useState(false);

  // Inicializa o estado de metas com persistência no localStorage
  const [metasCustomizadas, setMetasCustomizadas] = useState(() => {
    const saved = localStorage.getItem('moo_metas_salvas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      tamanho: 32,
      instrumentos: { ...GRADE_OFICIAL_MOO[32].instrumentos }
    };
  });

  // Atualizar quando outro componente (ex: TabelaRecomendacaoExcel) modificar recomendações
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('moo_metas_salvas');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.instrumentos) {
            setMetasCustomizadas(parsed);
            if (parsed.tamanho) setMetaTamanho(parsed.tamanho);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('moo_metas_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('moo_metas_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Atualiza quando o usuário clica num tamanho padrão (ex: 28, 32, 36, 40, 50, 60...)
  const aplicarTamanhoPadrao = (tamanho) => {
    const grade = gerarGradePadraoMoo(tamanho);
    setMetaTamanho(tamanho);
    const novoEstado = {
      tamanho,
      instrumentos: { ...grade.instrumentos }
    };
    setMetasCustomizadas(novoEstado);
    localStorage.setItem('moo_metas_salvas', JSON.stringify(novoEstado));
    localStorage.setItem('moo_rec_excel_ofic', JSON.stringify(grade.instrumentos));
    window.dispatchEvent(new Event('moo_metas_updated'));
  };

  // Salvar edições individuais personalizadas feitas pelo usuário
  const salvarEdicaoIndividual = () => {
    localStorage.setItem('moo_metas_salvas', JSON.stringify(metasCustomizadas));
    localStorage.setItem('moo_rec_excel_ofic', JSON.stringify(metasCustomizadas.instrumentos));
    window.dispatchEvent(new Event('moo_metas_updated'));
    setModoEdicaoIndividual(false);
  };

  // Restaurar padrão da apostila
  const restaurarPadraoApostila = () => {
    aplicarTamanhoPadrao(metaTamanho || 32);
    setModoEdicaoIndividual(false);
  };

  // Contagem dinâmica calculada a partir dos integrantes cadastrados no banco
  const musicos = integrantes.filter(i => i.categoria === 'Músico');
  const oficializados = musicos.filter(i => i.oficializado === true);

  const getContagemInstrumento = (nomeInst, apenasOfic = false) => {
    const base = apenasOfic ? oficializados : musicos;
    return base.filter(m => isMatchInstrumento(nomeInst, m.instrumento)).length;
  };

  // 24 Instrumentos da Planilha com dados em tempo real
  const instrumentosPlanilha = [
    { nome: 'VIOLINO', naipe: 'Cordas', voz: 'Soprano' },
    { nome: 'VIOLA', naipe: 'Cordas', voz: 'Contralto' },
    { nome: 'VIOLONCELO', naipe: 'Cordas', voz: 'Baixo' },

    { nome: 'FLAUTA', naipe: 'Madeiras', voz: 'Soprano' },
    { nome: 'OBOÉ', naipe: 'Madeiras', voz: 'Soprano' },
    { nome: "OBOÉ D'AMORE", naipe: 'Madeiras', voz: 'Soprano' },
    { nome: 'CORNE INGLÊS', naipe: 'Madeiras', voz: 'Contralto' },
    { nome: 'FAGOTE', naipe: 'Madeiras', voz: 'Baixo' },
    { nome: 'CLARINETE', naipe: 'Madeiras', voz: 'Soprano' },
    { nome: 'CLARINETE ALTO', naipe: 'Madeiras', voz: 'Contralto' },
    { nome: 'CLARINETE BAIXO', naipe: 'Madeiras', voz: 'Baixo' },
    { nome: 'SAXOFONE SOPRANO', naipe: 'Madeiras', voz: 'Soprano' },
    { nome: 'SAXOFONE ALTO', naipe: 'Madeiras', voz: 'Contralto' },
    { nome: 'SAXOFONE TENOR', naipe: 'Madeiras', voz: 'Tenor' },
    { nome: 'SAXOFONE BARÍTONO', naipe: 'Madeiras', voz: 'Baixo' },

    { nome: 'TROMPETE', naipe: 'Metais', voz: 'Soprano' },
    { nome: 'CORNET', naipe: 'Metais', voz: 'Soprano' },
    { nome: 'FLUGELHORN', naipe: 'Metais', voz: 'Soprano' },
    { nome: 'TROMPA', naipe: 'Metais', voz: 'Contralto' },
    { nome: 'TROMBONITO', naipe: 'Metais', voz: 'Tenor' },
    { nome: 'TROMBONE', naipe: 'Metais', voz: 'Tenor' },
    { nome: 'EUFÔNIO', naipe: 'Metais', voz: 'Baixo' },
    { nome: 'BARÍTONO SIb', naipe: 'Metais', voz: 'Baixo' },
    { nome: 'TUBA', naipe: 'Metais', voz: 'Baixo' }
  ].map(item => {
    // Contagem de alunos reais cadastrados no GEM
    const alunosDoInst = alunosGem.filter(a => isMatchInstrumento(item.nome, a.instrumento)).length;

    const atualOfic = getContagemInstrumento(item.nome, true);
    const orqNaoOfic = Math.max(0, getContagemInstrumento(item.nome, false) - atualOfic);
    // União: usa os alunos do GEM reais somados aos que estão em fase de culto/RJM
    const gemQtd = alunosDoInst > 0 ? alunosDoInst : orqNaoOfic;
    const totalComGem = atualOfic + gemQtd;
    const metaAtual = metasCustomizadas.instrumentos[item.nome] ?? 0;

    return {
      ...item,
      atualOfic,
      totalComGem,
      gemQtd,
      metaAtual
    };
  });

  // Totais calculados por Naipe
  const calcNaipe = (naipeNome, sub) => {
    const itens = instrumentosPlanilha.filter(i => i.naipe === naipeNome);
    const atual = itens.reduce((acc, curr) => acc + (sub === 'oficializados' ? curr.atualOfic : curr.totalComGem), 0);
    const ideal = itens.reduce((acc, curr) => acc + curr.metaAtual, 0);
    return { atual, ideal };
  };

  const cordasData = calcNaipe('Cordas', subModo);
  const madeirasData = calcNaipe('Madeiras', subModo);
  const metaisData = calcNaipe('Metais', subModo);

  const totalGeralIdeal = cordasData.ideal + madeirasData.ideal + metaisData.ideal;
  const totalGeralAtual = cordasData.atual + madeirasData.atual + metaisData.atual;
  const totalOfic = instrumentosPlanilha.reduce((acc, curr) => acc + curr.atualOfic, 0);
  const totalComGemGeral = instrumentosPlanilha.reduce((acc, curr) => acc + curr.totalComGem, 0);
  const totalAlunosGem = instrumentosPlanilha.reduce((acc, curr) => acc + curr.gemQtd, 0);

  const naipesGrafico = [
    { naipe: 'CORDAS', atual: cordasData.atual, ideal: cordasData.ideal, pctIdeal: '50%', corAtual: '#2563eb', corIdeal: '#93c5fd' },
    { naipe: 'MADEIRAS', atual: madeirasData.atual, ideal: madeirasData.ideal, pctIdeal: '25%', corAtual: '#059669', corIdeal: '#6ee7b7' },
    { naipe: 'METAIS', atual: metaisData.atual, ideal: metaisData.ideal, pctIdeal: '25%', corAtual: '#d97706', corIdeal: '#fcd34d' }
  ];

  const maxNaipeValor = Math.max(...naipesGrafico.map(n => Math.max(n.atual, n.ideal, 1)), 25);

  // Distribuição de Vozes (Soprano, Contralto, Tenor, Baixo) idêntica à planilha Gráficos 2
  const calcVozes = (sub) => {
    const getSoma = (vozNome) => {
      return instrumentosPlanilha
        .filter(i => i.voz === vozNome)
        .reduce((acc, curr) => acc + (sub === 'oficializados' ? curr.atualOfic : curr.totalComGem), 0);
    };
    const getIdealSoma = (vozNome) => {
      return instrumentosPlanilha
        .filter(i => i.voz === vozNome)
        .reduce((acc, curr) => acc + curr.metaAtual, 0);
    };
    return [
      { voz: 'Sopranos', atual: getSoma('Soprano'), ideal: getIdealSoma('Soprano'), cor: '#3b82f6' },
      { voz: 'Contraltos', atual: getSoma('Contralto'), ideal: getIdealSoma('Contralto'), cor: '#10b981' },
      { voz: 'Tenores', atual: getSoma('Tenor'), ideal: getIdealSoma('Tenor'), cor: '#f59e0b' },
      { voz: 'Baixos', atual: getSoma('Baixo'), ideal: getIdealSoma('Baixo'), cor: '#8b5cf6' }
    ];
  };

  const vozesData = calcVozes(subModo);
  const vozesOfic = calcVozes('oficializados');
  const vozesComGem = calcVozes('com_gem');

  // Helper para porcentagem
  const calcPct = (valor, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((valor / total) * 100)}%`;
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR SUPERIOR COMPACTA: CONTROLES E PADRONIZAÇÃO MOO */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                MOO Oficial • Vila Rui Barbosa
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Meta Geral: <strong className="text-slate-800">{totalGeralIdeal} Músicos</strong> (Regra MOO: 50% Cordas | 25% Madeiras | 25% Metais)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Painel de Equilíbrio & Gráficos da Orquestra
            </h2>
          </div>

          {/* Ações Rápidas: Alternador de Modo e Edição de Metas */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor Oficializados vs Com GEM */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setSubModo('oficializados')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                  subModo === 'oficializados'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Oficializados ({totalOfic})
              </button>
              <button
                onClick={() => setSubModo('com_gem')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                  subModo === 'com_gem'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orq. + GEM ({totalComGemGeral})
              </button>
            </div>

            {/* Botão de Edição de Metas */}
            {!readOnly && (!modoEdicaoIndividual ? (
              <button
                onClick={() => setModoEdicaoIndividual(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-300" />
                <span>Editar Metas</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={salvarEdicaoIndividual}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Metas</span>
                </button>
                <button
                  onClick={restaurarPadraoApostila}
                  title="Restaurar padrão da apostila MOO"
                  className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pílulas de Tamanho Padronizado MOO */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
            <Sliders className="w-3 h-3 text-blue-600" />
            Tamanho Padrão:
          </span>

          {TAMANHOS_PADRAO_MOO.map(tam => (
            <button
              key={tam}
              onClick={() => aplicarTamanhoPadrao(tam)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                metaTamanho === tam
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tam}
            </button>
          ))}

          {/* Input para digitação livre */}
          <div className="flex items-center gap-1 ml-auto bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
            <span className="text-[11px] text-slate-400 font-semibold">Outro:</span>
            <input
              type="number"
              min="4"
              max="120"
              value={metaTamanho}
              onChange={e => aplicarTamanhoPadrao(parseInt(e.target.value) || 32)}
              className="w-12 text-center font-bold text-xs bg-white border border-slate-200 rounded py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400">músicos</span>
          </div>
        </div>
      </div>

      {modoEdicaoIndividual && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span><strong>Modo de Edição de Metas Ativo:</strong> Edite os números na coluna 'Recomendado' nas planilhas abaixo e clique em <strong>Salvar Metas</strong>.</span>
          </div>
        </div>
      )}

      {/* SEÇÃO 1: GRÁFICOS INTEGRADOS COM LAYOUT APERFEIÇOADO */}
      <div className="space-y-4">
        {/* GRÁFICO COMBO PRINCIPAL (EXCEL 24 INSTRUMENTOS + LINHA RECOMENDADO) */}
        <ComboChartExcel
          titulo={subModo === 'oficializados' ? 'Músicos Oficializados (Orq. Completa)' : 'Músicos Oficializados + GEM (Orq. Completa)'}
          instrumentos={instrumentosPlanilha.map(item => ({
            nome: item.nome,
            atual: subModo === 'oficializados' ? item.atualOfic : item.totalComGem,
            rec: item.metaAtual
          }))}
          modo={subModo}
          onToggleModo={setSubModo}
          metaTotal={totalGeralIdeal}
          atualTotal={totalGeralAtual}
        />

        {/* GRÁFICOS COMPANHEIROS LADO A LADO: NAIPES & VOZES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Comparativo por Naipes (ATUAL vs IDEAL) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Comparativo por Naipes ({subModo === 'oficializados' ? 'Oficializados' : 'Orq + GEM'})
                </h4>
                <span className="text-[11px] text-slate-500">Regra MOO: 50% Cordas | 25% Madeiras | 25% Metais</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Atual
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-blue-200 border border-blue-400"></span> Ideal
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 h-44 items-end border-b border-slate-200 px-4 pt-2 pb-1">
              {naipesGrafico.map(n => {
                const alturaAtualPct = Math.min(100, (n.atual / maxNaipeValor) * 100);
                const alturaIdealPct = Math.min(100, (n.ideal / maxNaipeValor) * 100);

                return (
                  <div key={n.naipe} className="flex flex-col items-center h-full justify-end">
                    <div className="flex items-end gap-2 w-full justify-center h-full">
                      {/* Coluna Atual */}
                      <div className="flex flex-col items-center flex-1 max-w-[36px] h-full justify-end">
                        <span className="text-xs font-black text-slate-800 mb-0.5">{n.atual}</span>
                        <div
                          className="w-full rounded-t-md transition-all duration-300 shadow-sm"
                          style={{
                            height: `${Math.max(12, alturaAtualPct)}%`,
                            backgroundColor: n.corAtual
                          }}
                        ></div>
                      </div>

                      {/* Coluna Ideal */}
                      <div className="flex flex-col items-center flex-1 max-w-[36px] h-full justify-end">
                        <span className="text-xs font-bold text-slate-500 mb-0.5">{n.ideal}</span>
                        <div
                          className="w-full rounded-t-md transition-all duration-300 border border-dashed border-slate-400/80"
                          style={{
                            height: `${Math.max(12, alturaIdealPct)}%`,
                            backgroundColor: n.corIdeal
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                        {n.naipe}
                      </span>
                      <span className="text-[10px] font-bold block">
                        {n.atual < n.ideal ? (
                          <span className="text-blue-600">Falta {n.ideal - n.atual}</span>
                        ) : n.atual > n.ideal ? (
                          <span className="text-red-600">+{n.atual - n.ideal}</span>
                        ) : (
                          <span className="text-emerald-600">Ideal</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Equilíbrio de Vozes (Soprano, Contralto, Tenor, Baixo) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Equilíbrio de Vozes ({subModo === 'oficializados' ? 'Ofic.' : 'Orq + GEM'})
                </h4>
                <span className="text-[11px] text-slate-500">Distribuição harmônica dos 24 instrumentos</span>
              </div>
              <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                Total: {totalGeralAtual} músicos
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {vozesData.map(v => {
                const pctAtual = totalGeralAtual > 0 ? Math.round((v.atual / totalGeralAtual) * 100) : 0;
                const pctIdeal = totalGeralIdeal > 0 ? Math.round((v.ideal / totalGeralIdeal) * 100) : 0;

                return (
                  <div key={v.voz} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.cor }}></span>
                        {v.voz}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{v.atual}</span>
                        <span className="text-[11px] text-slate-400">({pctAtual}%)</span>
                        <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                          Meta: {v.ideal} ({pctIdeal}%)
                        </span>
                      </div>
                    </div>
                    {/* Barra de Progresso Visual */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (v.atual / Math.max(1, v.ideal)) * 100)}%`,
                          backgroundColor: v.cor
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: PLANILHAS MAIS JUNTAS (Idêntico ao Excel Gráficos 2 e Orq. Completa) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        {/* Barra de Controle das Planilhas */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Planilhas de Distribuição Detalhada (24 Instrumentos)
            </h3>
            <p className="text-[11px] text-slate-500">
              Legenda da Planilha: <strong className="text-blue-600">AZUL = FALTANDO</strong> | <strong className="text-emerald-600">VERDE = IDEAL</strong> | <strong className="text-red-600">VERMELHO = EXCESSO</strong>
            </p>
          </div>

          {/* Alternador de Layout das Planilhas */}
          <div className="flex flex-wrap items-center bg-white p-1 rounded-xl border border-slate-300 text-xs shadow-xs gap-1">
            <button
              onClick={() => setViewModoTabelas('modelo_cores')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewModoTabelas === 'modelo_cores'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibe o modelo com o design e cores fiéis da imagem da planilha"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>🎨 Modelo Cores Planilha</span>
            </button>

            <button
              onClick={() => setViewModoTabelas('lado_a_lado')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewModoTabelas === 'lado_a_lado'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibe as planilhas de Oficializados e GEM lado a lado como no Excel"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Lado a Lado (Excel)</span>
            </button>

            <button
              onClick={() => setViewModoTabelas('consolidada')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewModoTabelas === 'consolidada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibe uma tabela consolidada única com todas as colunas"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Consolidada</span>
            </button>

            <button
              onClick={() => setViewModoTabelas('relacao')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewModoTabelas === 'relacao'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibe a Tabela Relação oficial da planilha"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tabela RELAÇÃO</span>
            </button>
          </div>
        </div>

        {/* MODO NOVO: MODELO FIEL COM DESIGN E CORES DA PLANILHA */}
        {viewModoTabelas === 'modelo_cores' && (
          <div className="p-3">
            <TabelaRecomendacaoExcel 
              integrantes={integrantes} 
              metaTamanhoOfic={metaTamanho}
              metaTamanhoGem={50}
            />
          </div>
        )}

        {/* MODO 1: PLANILHAS LADO A LADO (LAYOUT EXCEL GRÁFICOS 2) */}
        {viewModoTabelas === 'lado_a_lado' && (
          <div className="p-3 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
              {/* PLANILHA 1 (ESQUERDA): MÚSICOS OFICIALIZADOS */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-[#5b9bd5] text-white px-3 py-2 font-black text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-400">
                  <span>ORQUESTRA ATUAL COM MÚSICOS OFICIALIZADOS</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
                    Total: {totalOfic}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-300">
                        <th className="py-1 px-2.5 border-r border-slate-200">INSTRUMENTO</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-16">REC.</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-20">OFICIAL.</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-16">% ORQ.</th>
                        <th className="py-1 px-2 text-center w-20">BALANÇO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {instrumentosPlanilha.map((item, idx) => {
                        const rec = item.metaAtual;
                        const atual = item.atualOfic;
                        const diff = atual - rec;
                        const pctStr = calcPct(atual, totalOfic);

                        let badgeBg = 'bg-blue-100 text-blue-800 border-blue-300';
                        let badgeText = `${diff}`;
                        if (atual === rec && rec > 0) {
                          badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          badgeText = 'OK';
                        } else if (atual > rec) {
                          badgeBg = 'bg-red-100 text-red-800 border-red-300';
                          badgeText = `+${diff}`;
                        } else if (atual === 0 && rec === 0) {
                          badgeBg = 'bg-slate-100 text-slate-500 border-slate-200';
                          badgeText = '-';
                        }

                        return (
                          <tr key={idx} className={`hover:bg-blue-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            <td className="py-1 px-2.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                              {item.nome}
                            </td>
                            <td className="py-1 px-2 text-center font-bold text-slate-600 border-r border-slate-200">
                              {modoEdicaoIndividual ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  value={rec}
                                  onChange={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    setMetasCustomizadas(prev => ({
                                      ...prev,
                                      instrumentos: { ...prev.instrumentos, [item.nome]: val }
                                    }));
                                  }}
                                  className="w-12 text-center py-0.5 border border-blue-500 rounded font-bold text-blue-900 bg-blue-50"
                                />
                              ) : (
                                rec
                              )}
                            </td>
                            <td className="py-1 px-2 text-center font-black text-slate-900 border-r border-slate-200 text-sm">
                              {atual}
                            </td>
                            <td className="py-1 px-2 text-center font-semibold text-slate-500 border-r border-slate-200 text-[11px]">
                              {atual > 0 ? pctStr : ''}
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border inline-block ${badgeBg}`}>
                                {badgeText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-200 font-extrabold text-slate-900 border-t-2 border-slate-400">
                      <tr>
                        <td className="py-1.5 px-2.5">TOTAL ORQUESTRA</td>
                        <td className="py-1.5 px-2 text-center">{totalGeralIdeal}</td>
                        <td className="py-1.5 px-2 text-center text-sm font-black text-blue-700">{totalOfic}</td>
                        <td className="py-1.5 px-2 text-center">100%</td>
                        <td className="py-1.5 px-2 text-center text-[10px] text-slate-600">Oficializados</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* PLANILHA 2 (DIREITA): MÚSICOS OFICIALIZADOS + GEM */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-[#41719c] text-white px-3 py-2 font-black text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-400">
                  <span>ORQUESTRA + ALUNOS GEM</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
                    Total: {totalComGemGeral} (GEM: {totalAlunosGem})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-300">
                        <th className="py-1 px-2.5 border-r border-slate-200">INSTRUMENTO</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-16">REC.</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-14 text-amber-700">GEM</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-20">ORQ+GEM</th>
                        <th className="py-1 px-2 text-center border-r border-slate-200 w-16">% TOTAL</th>
                        <th className="py-1 px-2 text-center w-20">BALANÇO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {instrumentosPlanilha.map((item, idx) => {
                        const rec = item.metaAtual;
                        const atual = item.totalComGem;
                        const diff = atual - rec;
                        const pctStr = calcPct(atual, totalComGemGeral);

                        let badgeBg = 'bg-blue-100 text-blue-800 border-blue-300';
                        let badgeText = `${diff}`;
                        if (atual === rec && rec > 0) {
                          badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          badgeText = 'OK';
                        } else if (atual > rec) {
                          badgeBg = 'bg-red-100 text-red-800 border-red-300';
                          badgeText = `+${diff}`;
                        } else if (atual === 0 && rec === 0) {
                          badgeBg = 'bg-slate-100 text-slate-500 border-slate-200';
                          badgeText = '-';
                        }

                        return (
                          <tr key={idx} className={`hover:bg-blue-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            <td className="py-1 px-2.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                              {item.nome}
                            </td>
                            <td className="py-1 px-2 text-center font-bold text-slate-600 border-r border-slate-200">
                              {rec}
                            </td>
                            <td className="py-1 px-2 text-center font-extrabold text-amber-700 border-r border-slate-200">
                              {item.gemQtd > 0 ? item.gemQtd : '-'}
                            </td>
                            <td className="py-1 px-2 text-center font-black text-slate-900 border-r border-slate-200 text-sm">
                              {atual}
                            </td>
                            <td className="py-1 px-2 text-center font-semibold text-slate-500 border-r border-slate-200 text-[11px]">
                              {atual > 0 ? pctStr : ''}
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border inline-block ${badgeBg}`}>
                                {badgeText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-200 font-extrabold text-slate-900 border-t-2 border-slate-400">
                      <tr>
                        <td className="py-1.5 px-2.5">TOTAL COM GEM</td>
                        <td className="py-1.5 px-2 text-center">{totalGeralIdeal}</td>
                        <td className="py-1.5 px-2 text-center font-black text-amber-700">{totalAlunosGem}</td>
                        <td className="py-1.5 px-2 text-center text-sm font-black text-blue-700">{totalComGemGeral}</td>
                        <td className="py-1.5 px-2 text-center">100%</td>
                        <td className="py-1.5 px-2 text-center text-[10px] text-slate-600">Com Alunos</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* TABELA COMPLEMENTAR DE VOZES LADO A LADO (SOPRANOS, CONTRALTOS, TENORES, BAIXOS) */}
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="bg-slate-800 text-white px-3 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>EQUILÍBRIO HARMÔNICO POR VOZES — COMPARATIVO COMPLETO</span>
                <span className="text-[11px] text-slate-300">Oficializados vs Com GEM</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                      <th className="py-1.5 px-3 border-r border-slate-200">VOZ</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-200">REC. IDEAL</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-200">OFIC. ATUAL</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-200">% OFIC.</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-200 text-amber-700">ALUNOS GEM</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-200">TOTAL COM GEM</th>
                      <th className="py-1.5 px-2 text-center">% TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vozesOfic.map((v, i) => {
                      const vGem = vozesComGem[i];
                      const gemDiff = vGem.atual - v.atual;
                      return (
                        <tr key={v.voz} className="hover:bg-slate-50 transition">
                          <td className="py-1 px-3 font-bold text-slate-900 border-r border-slate-200 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.cor }}></span>
                            {v.voz}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-600 border-r border-slate-200">{v.ideal}</td>
                          <td className="py-1 px-2 text-center font-black text-slate-900 border-r border-slate-200 text-sm">{v.atual}</td>
                          <td className="py-1 px-2 text-center font-semibold text-slate-500 border-r border-slate-200">{calcPct(v.atual, totalOfic)}</td>
                          <td className="py-1 px-2 text-center font-bold text-amber-700 border-r border-slate-200">{gemDiff > 0 ? gemDiff : '-'}</td>
                          <td className="py-1 px-2 text-center font-black text-blue-700 border-r border-slate-200 text-sm">{vGem.atual}</td>
                          <td className="py-1 px-2 text-center font-semibold text-slate-500">{calcPct(vGem.atual, totalComGemGeral)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="py-1.5 px-3">TOTAL GERAL</td>
                      <td className="py-1.5 px-2 text-center">{totalGeralIdeal}</td>
                      <td className="py-1.5 px-2 text-center text-sm font-black text-blue-700">{totalOfic}</td>
                      <td className="py-1.5 px-2 text-center">100%</td>
                      <td className="py-1.5 px-2 text-center font-black text-amber-700">{totalAlunosGem}</td>
                      <td className="py-1.5 px-2 text-center text-sm font-black text-blue-700">{totalComGemGeral}</td>
                      <td className="py-1.5 px-2 text-center">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODO 2: PLANILHA CONSOLIDADA ÚNICA (TODAS AS COLUNAS JUNTAS) */}
        {viewModoTabelas === 'consolidada' && (
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-800 text-white font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3 border border-slate-700">INSTRUMENTO</th>
                  <th className="py-2 px-2 border border-slate-700">NAIPE</th>
                  <th className="py-2 px-2 border border-slate-700">VOZ</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-16">REC. MOO</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-20">OFICIAL.</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-16 text-amber-300">ALUNOS GEM</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-20">ORQ + GEM</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-24">STATUS (OFIC.)</th>
                  <th className="py-2 px-2 text-center border border-slate-700 w-24">STATUS (+GEM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {instrumentosPlanilha.map((item, idx) => {
                  const rec = item.metaAtual;
                  const diffOfic = item.atualOfic - rec;
                  const diffGem = item.totalComGem - rec;

                  return (
                    <tr key={idx} className={`hover:bg-blue-50/50 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">{item.nome}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          item.naipe === 'Cordas' ? 'bg-blue-50 text-blue-700' :
                          item.naipe === 'Madeiras' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {item.naipe}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-slate-500 font-medium">{item.voz}</td>
                      <td className="py-1.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">
                        {modoEdicaoIndividual ? (
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={rec}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              setMetasCustomizadas(prev => ({
                                ...prev,
                                instrumentos: { ...prev.instrumentos, [item.nome]: val }
                              }));
                            }}
                            className="w-12 text-center py-0.5 border border-blue-500 rounded font-bold text-blue-900 bg-blue-50"
                          />
                        ) : (
                          rec
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-slate-900 border-r border-slate-300 text-sm">
                        {item.atualOfic}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-amber-700 border-r border-slate-300">
                        {item.gemQtd > 0 ? item.gemQtd : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-blue-700 border-r border-slate-300 text-sm">
                        {item.totalComGem}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-300">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          diffOfic < 0 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          diffOfic > 0 ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {diffOfic < 0 ? `Falta ${Math.abs(diffOfic)}` : diffOfic > 0 ? `+${diffOfic}` : 'Ideal'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          diffGem < 0 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          diffGem > 0 ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {diffGem < 0 ? `Falta ${Math.abs(diffGem)}` : diffGem > 0 ? `+${diffGem}` : 'Ideal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-400">
                <tr>
                  <td className="py-2 px-3">TOTAL GERAL</td>
                  <td></td>
                  <td></td>
                  <td className="py-2 px-2 text-center text-sm">{totalGeralIdeal}</td>
                  <td className="py-2 px-2 text-center text-sm text-blue-800">{totalOfic}</td>
                  <td className="py-2 px-2 text-center text-amber-700">{totalAlunosGem}</td>
                  <td className="py-2 px-2 text-center text-base text-blue-900">{totalComGemGeral}</td>
                  <td className="py-2 px-2 text-center text-slate-500 text-[10px]">Músicos Ofic.</td>
                  <td className="py-2 px-2 text-center text-slate-500 text-[10px]">Ofic. + Alunos</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* MODO 3: TABELA RELAÇÃO OFICIAL DA PLANILHA */}
        {viewModoTabelas === 'relacao' && (
          <div className="p-4 flex flex-col items-center">
            <div className="max-w-md w-full">
              <RelacaoTable integrantes={integrantes} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
