import React, { useState, useEffect } from 'react';
import { Printer, Download, Sparkles, Sliders, Edit3, Check, RotateCcw, Scale } from 'lucide-react';
import { TAMANHOS_PADRAO_MOO, GRADE_OFICIAL_MOO, gerarGradePadraoMoo } from '../constants/mooStandard.js';
import { isMatchInstrumento } from '../utils/instrumentMatcher.js';

export default function TabelaRecomendacaoExcel({ 
  integrantes = [],
  alunosGem = [],
  metaTamanhoOfic = 32,
  metaTamanhoGem = 50,
  readOnly = false
}) {
  // Tamanho da Orquestra Oficial (Tabela Esquerda)
  const [tamanhoOfic, setTamanhoOfic] = useState(() => {
    const mooSalvo = localStorage.getItem('moo_metas_salvas');
    if (mooSalvo) {
      try {
        const p = JSON.parse(mooSalvo);
        if (p && p.tamanho) return p.tamanho;
      } catch (e) {}
    }
    const salvoOfic = localStorage.getItem('moo_rec_excel_tamanho_ofic');
    if (salvoOfic) return parseInt(salvoOfic) || 32;
    return metaTamanhoOfic || 32;
  });

  // Tamanho da Orquestra com GEM (Tabela Direita)
  const [tamanhoGem, setTamanhoGem] = useState(() => {
    const salvo = localStorage.getItem('moo_rec_excel_tamanho_gem');
    return salvo ? parseInt(salvo) || 50 : metaTamanhoGem || 50;
  });

  // Metas customizáveis com persistência local da Tabela Esquerda (Oficializados)
  const [metasOfic, setMetasOfic] = useState(() => {
    const mooSalvo = localStorage.getItem('moo_metas_salvas');
    if (mooSalvo) {
      try {
        const p = JSON.parse(mooSalvo);
        if (p && p.instrumentos) return p.instrumentos;
      } catch (e) {}
    }
    const saved = localStorage.getItem('moo_rec_excel_ofic');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return GRADE_OFICIAL_MOO[32]?.instrumentos || {};
  });

  // Metas customizáveis da Tabela Direita (Orquestra + GEM)
  const [metasGem, setMetasGem] = useState(() => {
    const saved = localStorage.getItem('moo_rec_excel_gem');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return GRADE_OFICIAL_MOO[50]?.instrumentos || {};
  });

  const [modoEdicao, setModoEdicao] = useState(false);

  // Escutar atualizações de recomendações feitas em outras partes do sistema
  useEffect(() => {
    const handleUpdate = () => {
      const mooSalvo = localStorage.getItem('moo_metas_salvas');
      if (mooSalvo) {
        try {
          const p = JSON.parse(mooSalvo);
          if (p && p.instrumentos) {
            setMetasOfic(p.instrumentos);
            if (p.tamanho) setTamanhoOfic(p.tamanho);
          }
        } catch (e) {}
      }
      const gemSalvo = localStorage.getItem('moo_rec_excel_gem');
      if (gemSalvo) {
        try {
          const pGem = JSON.parse(gemSalvo);
          if (pGem) setMetasGem(pGem);
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

  // Aplicar tamanho padrão MOO para a Orquestra Oficial (Tabela Esquerda)
  const aplicarTamanhoOfic = (tam) => {
    const grade = gerarGradePadraoMoo(tam);
    setTamanhoOfic(tam);
    setMetasOfic({ ...grade.instrumentos });
    localStorage.setItem('moo_rec_excel_tamanho_ofic', tam.toString());
    localStorage.setItem('moo_rec_excel_ofic', JSON.stringify(grade.instrumentos));
    localStorage.setItem('moo_metas_salvas', JSON.stringify({ tamanho: tam, instrumentos: grade.instrumentos }));
    window.dispatchEvent(new Event('moo_metas_updated'));
  };

  // Aplicar tamanho padrão MOO para Orquestra + GEM (Tabela Direita)
  const aplicarTamanhoGem = (tam) => {
    const grade = gerarGradePadraoMoo(tam);
    setTamanhoGem(tam);
    setMetasGem({ ...grade.instrumentos });
    localStorage.setItem('moo_rec_excel_tamanho_gem', tam.toString());
    localStorage.setItem('moo_rec_excel_gem', JSON.stringify(grade.instrumentos));
    window.dispatchEvent(new Event('moo_metas_updated'));
  };

  const salvarMetas = () => {
    localStorage.setItem('moo_rec_excel_ofic', JSON.stringify(metasOfic));
    localStorage.setItem('moo_rec_excel_gem', JSON.stringify(metasGem));
    localStorage.setItem('moo_metas_salvas', JSON.stringify({ tamanho: tamanhoOfic, instrumentos: metasOfic }));
    window.dispatchEvent(new Event('moo_metas_updated'));
    setModoEdicao(false);
  };

  const restaurarMetas = () => {
    aplicarTamanhoOfic(tamanhoOfic || 32);
    aplicarTamanhoGem(tamanhoGem || 50);
    setModoEdicao(false);
  };

  // Contagem dinâmica calculada a partir dos integrantes reais
  const musicos = integrantes.filter(i => i.categoria === 'Músico');
  const oficializados = musicos.filter(i => i.oficializado === true);

  const getContagemInstrumento = (nomeInst, apenasOfic = false) => {
    const base = apenasOfic ? oficializados : musicos;
    return base.filter(m => isMatchInstrumento(nomeInst, m.instrumento)).length;
  };

  // 24 Instrumentos da Planilha Oficial
  const listaInstrumentos = [
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
    const gemQtd = alunosDoInst > 0 ? alunosDoInst : orqNaoOfic;
    const totalComGem = atualOfic + gemQtd;
    const recOfic = metasOfic[item.nome] !== undefined ? metasOfic[item.nome] : (GRADE_OFICIAL_MOO[tamanhoOfic]?.instrumentos[item.nome] ?? GRADE_OFICIAL_MOO[32]?.instrumentos[item.nome] ?? 0);
    const recGem = metasGem[item.nome] !== undefined ? metasGem[item.nome] : (GRADE_OFICIAL_MOO[tamanhoGem]?.instrumentos[item.nome] ?? GRADE_OFICIAL_MOO[50]?.instrumentos[item.nome] ?? 0);

    return {
      ...item,
      atualOfic,
      gemQtd,
      totalComGem,
      recOfic,
      recGem
    };
  });

  // Funções de Status e Cor idênticas à imagem da planilha:
  // AZUL = FALTANDO (#00a2e8)
  // VERDE = IDEAL (#00b050)
  // VERMELHO = EM EXCESSO (#ed1c24)
  const getCorStatus = (atual, rec) => {
    if (atual < rec) return '#00a2e8'; // Azul
    if (atual === rec) return '#00b050'; // Verde
    return '#ed1c24'; // Vermelho
  };

  // Totais Gerais
  const totalRecOfic = listaInstrumentos.reduce((acc, curr) => acc + curr.recOfic, 0);
  const totalAtualOfic = listaInstrumentos.reduce((acc, curr) => acc + curr.atualOfic, 0);

  const totalRecGem = listaInstrumentos.reduce((acc, curr) => acc + curr.recGem, 0);
  const totalGemAlunos = listaInstrumentos.reduce((acc, curr) => acc + curr.gemQtd, 0);
  const totalOrqComGem = listaInstrumentos.reduce((acc, curr) => acc + curr.totalComGem, 0);

  // Totais por Naipe para mesclar as porcentagens
  const cordasItens = listaInstrumentos.filter(i => i.naipe === 'Cordas');
  const madeirasItens = listaInstrumentos.filter(i => i.naipe === 'Madeiras');
  const metaisItens = listaInstrumentos.filter(i => i.naipe === 'Metais');

  const calcNaipeStats = (itens) => {
    const recOfic = itens.reduce((a, b) => a + b.recOfic, 0);
    const atualOfic = itens.reduce((a, b) => a + b.atualOfic, 0);
    const recGem = itens.reduce((a, b) => a + b.recGem, 0);
    const totalGem = itens.reduce((a, b) => a + b.totalComGem, 0);

    return {
      pctRecOfic: totalRecOfic > 0 ? Math.round((recOfic / totalRecOfic) * 100) : 0,
      pctAtualOfic: totalAtualOfic > 0 ? Math.round((atualOfic / totalAtualOfic) * 100) : 0,
      corOfic: getCorStatus(atualOfic, recOfic),

      pctRecGem: totalRecGem > 0 ? Math.round((recGem / totalRecGem) * 100) : 0,
      pctTotalGem: totalOrqComGem > 0 ? Math.round((totalGem / totalOrqComGem) * 100) : 0,
      corGem: getCorStatus(totalGem, recGem)
    };
  };

  const cordasStats = calcNaipeStats(cordasItens);
  const madeirasStats = calcNaipeStats(madeirasItens);
  const metaisStats = calcNaipeStats(metaisItens);

  // Totais por Voz (Sopranos, Contraltos, Tenores, Baixos)
  const calcVozRow = (nomeVoz) => {
    const itens = listaInstrumentos.filter(i => i.voz === nomeVoz);
    const recOfic = itens.reduce((a, b) => a + b.recOfic, 0);
    const atualOfic = itens.reduce((a, b) => a + b.atualOfic, 0);
    const pctRecOfic = totalRecOfic > 0 ? Math.round((recOfic / totalRecOfic) * 100) : 0;
    const pctAtualOfic = totalAtualOfic > 0 ? Math.round((atualOfic / totalAtualOfic) * 100) : 0;
    const corOfic = getCorStatus(atualOfic, recOfic);

    const recGem = itens.reduce((a, b) => a + b.recGem, 0);
    const totalGem = itens.reduce((a, b) => a + b.totalComGem, 0);
    const pctRecGem = totalRecGem > 0 ? Math.round((recGem / totalRecGem) * 100) : 0;
    const pctTotalGem = totalOrqComGem > 0 ? Math.round((totalGem / totalOrqComGem) * 100) : 0;
    const corGem = getCorStatus(totalGem, recGem);

    return {
      nome: nomeVoz === 'Contralto' ? 'Coltraltos' : nomeVoz + 's',
      recOfic,
      pctRecOfic,
      atualOfic,
      pctAtualOfic,
      corOfic,
      recGem,
      pctRecGem,
      totalGem,
      pctTotalGem,
      corGem
    };
  };

  const vozesRows = [
    calcVozRow('Soprano'),
    calcVozRow('Contralto'),
    calcVozRow('Tenor'),
    calcVozRow('Baixo')
  ];

  return (
    <div className="space-y-4 animate-fadeIn font-sans">
      {/* Barra Superior de Ferramentas com Seletores de Tamanho MOO */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-300 shadow-sm space-y-4 no-print">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              Modelo Oficial de Tabela — Relação & Recomendação (Excel)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fidelidade 100% ao design, cores e mesclagens de células da planilha. As recomendações atualizam dinamicamente conforme os parâmetros do MOO.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {!readOnly && (!modoEdicao ? (
              <button
                onClick={() => setModoEdicao(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                title="Editar individualmente cada meta recomendada"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-300" />
                <span>Editar Valores Manuais</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={salvarMetas}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Metas</span>
                </button>
                <button
                  onClick={restaurarMetas}
                  className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Seletores de Tamanho da Orquestra MOO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
          {/* Seletor Orquestra Oficial (Tabela Esquerda) */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Recomendação Orquestra Oficial (Apostila MOO):
              </span>
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-black text-[11px] border border-blue-200">
                Meta: {tamanhoOfic} Músicos
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {[20, 24, 28, 32, 36, 40, 44, 48, 50, 56, 60, 64].map(tam => (
                <button
                  key={`ofic-${tam}`}
                  onClick={() => aplicarTamanhoOfic(tam)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                    tamanhoOfic === tam
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {tam}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor Orquestra + GEM (Tabela Direita) */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Recomendação Orquestra + GEM:
              </span>
              <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black text-[11px] border border-emerald-200">
                Meta: {tamanhoGem} Músicos
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {[28, 32, 36, 40, 44, 48, 50, 56, 60, 64, 70, 80].map(tam => (
                <button
                  key={`gem-${tam}`}
                  onClick={() => aplicarTamanhoGem(tam)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                    tamanhoGem === tam
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {tam}
                </button>
              ))}
            </div>
          </div>
        </div>

        {modoEdicao && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
            <span className="font-bold">⚠️ Modo de Edição Ativo:</span>
            <span>Altere os valores numéricos diretamente na coluna "RECOMENDADO" das tabelas abaixo e clique em <b>Salvar Metas</b>.</span>
          </div>
        )}
      </div>

      {/* ÁREA DA TABELA COM O DESIGN E CORES EXATOS DA PLANILHA */}
      <div className="bg-white p-2 sm:p-5 rounded-2xl shadow-xl border-2 border-black overflow-x-auto">
        <div className="min-w-[920px] max-w-6xl mx-auto space-y-4">
          
          {/* TÍTULO PRINCIPAL SUPERIOR (BORDAS PRETAS IDÊNTICAS AO EXCEL) */}
          <div className="border-2 border-black bg-white py-1.5 px-4 text-center">
            <h1 className="text-sm sm:text-base font-black tracking-wider text-black uppercase">
              RELAÇÃO E RECOMENDAÇÃO VILA RUI BARBOSA - ORQUESTRA COMPLETA
            </h1>
          </div>

          {/* GRID COM AS DUAS TABELAS LADO A LADO */}
          <div className="grid grid-cols-2 gap-4 items-start">
            
            {/* ======================================================== */}
            {/* TABELA ESQUERDA: ORQUESTRA ATUAL COM MÚSICOS OFICIALIZADOS */}
            {/* ======================================================== */}
            <div className="border-2 border-black">
              {/* Cabeçalho Oficializado */}
              <div className="bg-white text-black font-black text-[11px] sm:text-xs text-center py-1 px-2 border-b-2 border-black uppercase tracking-wide flex items-center justify-between">
                <span>ORQUESTRA ATUAL COM MÚSICOS OFICIALIZADOS</span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-400 font-bold">
                  META: {tamanhoOfic} MÚSICOS
                </span>
              </div>
              {/* Subtítulo de Cores */}
              <div className="bg-white text-black font-bold text-[10px] text-center py-0.5 px-2 border-b-2 border-black">
                AZUL= FALTANDO / VERMELHO= EM EXCESSO / VERDE= IDEAL
              </div>

              {/* Tabela de Instrumentos Oficializados */}
              <table className="w-full border-collapse text-[11px] font-sans">
                <thead>
                  <tr className="bg-white text-black font-black text-[10px] uppercase border-b-2 border-black text-center">
                    <th className="py-1 px-2 border-r border-black text-left w-36">INSTRUMENTO</th>
                    <th className="py-1 px-1.5 border-r border-black w-20">RECOMENDADO</th>
                    <th className="py-1 px-1.5 border-r border-black w-14">% REC.</th>
                    <th className="py-1 px-1.5 border-r border-black w-24 leading-tight">ORQUESTRA R. BARBOSA</th>
                    <th className="py-1 px-1.5 w-16 leading-tight">% Orquestra</th>
                  </tr>
                </thead>
                <tbody>
                  {listaInstrumentos.map((item, idx) => {
                    const corFundo = getCorStatus(item.atualOfic, item.recOfic);

                    // Lógica para as células mescladas por Naipe
                    const isCordasFirst = idx === 0;
                    const isMadeirasFirst = idx === 3;
                    const isMetaisFirst = idx === 15;

                    return (
                      <tr key={item.nome} className="border-b border-black text-black">
                        {/* Nome do Instrumento com cor de fundo do status */}
                        <td
                          className="py-0.5 px-2 border-r border-black font-black text-black tracking-tight"
                          style={{ backgroundColor: corFundo }}
                        >
                          {item.nome}
                        </td>

                        {/* Recomendado */}
                        <td className="py-0.5 px-1.5 border-r border-black text-center font-bold bg-white">
                          {modoEdicao ? (
                            <input
                              type="number"
                              min="0"
                              value={item.recOfic}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setMetasOfic(prev => ({ ...prev, [item.nome]: val }));
                              }}
                              className="w-10 text-center py-0 border border-blue-600 font-bold bg-blue-50"
                            />
                          ) : (
                            item.recOfic
                          )}
                        </td>

                        {/* % REC. (Célula mesclada por Naipe) */}
                        {isCordasFirst && (
                          <td rowSpan={3} className="border-r border-black text-center font-bold bg-white align-middle">
                            {cordasStats.pctRecOfic}%
                          </td>
                        )}
                        {isMadeirasFirst && (
                          <td rowSpan={12} className="border-r border-black text-center font-bold bg-white align-middle">
                            {madeirasStats.pctRecOfic}%
                          </td>
                        )}
                        {isMetaisFirst && (
                          <td rowSpan={9} className="border-r border-black text-center font-bold bg-white align-middle">
                            {metaisStats.pctRecOfic}%
                          </td>
                        )}

                        {/* Atual Oficializado */}
                        <td className="py-0.5 px-1.5 border-r border-black text-center font-black bg-white text-xs">
                          {item.atualOfic}
                        </td>

                        {/* % Orquestra (Célula mesclada por Naipe com cor de fundo viva!) */}
                        {isCordasFirst && (
                          <td
                            rowSpan={3}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: cordasStats.corOfic }}
                          >
                            {cordasStats.pctAtualOfic}%
                          </td>
                        )}
                        {isMadeirasFirst && (
                          <td
                            rowSpan={12}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: madeirasStats.corOfic }}
                          >
                            {madeirasStats.pctAtualOfic}%
                          </td>
                        )}
                        {isMetaisFirst && (
                          <td
                            rowSpan={9}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: metaisStats.corOfic }}
                          >
                            {metaisStats.pctAtualOfic}%
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-white font-black text-black border-t-2 border-black text-center">
                    <td className="py-1 px-2 border-r border-black text-left">TOTAL</td>
                    <td className="py-1 px-1.5 border-r border-black">{totalRecOfic}</td>
                    <td className="py-1 px-1.5 border-r border-black">100%</td>
                    <td className="py-1 px-1.5 border-r border-black text-xs">{totalAtualOfic}</td>
                    <td className="py-1 px-1.5">100,00%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ======================================================== */}
            {/* TABELA DIREITA: ORQUESTRA + GEM - ORQ. COMPLETA */}
            {/* ======================================================== */}
            <div className="border-2 border-black">
              {/* Cabeçalho GEM */}
              <div className="bg-white text-black font-black text-[11px] sm:text-xs text-center py-1 px-2 border-b-2 border-black uppercase tracking-wide flex items-center justify-between">
                <span>ORQUESTRA + GEM - ORQ. COMPLETA</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-400 font-bold">
                  META: {tamanhoGem} MÚSICOS
                </span>
              </div>
              {/* Subtítulo de Cores */}
              <div className="bg-white text-black font-bold text-[10px] text-center py-0.5 px-2 border-b-2 border-black">
                AZUL= FALTANDO / VERMELHO= EM EXCESSO / VERDE= IDEAL
              </div>

              {/* Tabela de Instrumentos Com GEM */}
              <table className="w-full border-collapse text-[11px] font-sans">
                <thead>
                  <tr className="bg-white text-black font-black text-[10px] uppercase border-b-2 border-black text-center">
                    <th className="py-1 px-2 border-r border-black text-left w-36">INSTRUMENTO</th>
                    <th className="py-1 px-1.5 border-r border-black w-20">RECOMENDADO</th>
                    <th className="py-1 px-1 border-r border-black w-14">% REC.</th>
                    <th className="py-1 px-1 border-r border-black w-14">GEM</th>
                    <th className="py-1 px-1.5 border-r border-black w-16 leading-tight">ORQ + GEM</th>
                    <th className="py-1 px-1.5 w-16 leading-tight">% ORQ + GEM</th>
                  </tr>
                </thead>
                <tbody>
                  {listaInstrumentos.map((item, idx) => {
                    const corFundo = getCorStatus(item.totalComGem, item.recGem);

                    // Células mescladas por Naipe
                    const isCordasFirst = idx === 0;
                    const isMadeirasFirst = idx === 3;
                    const isMetaisFirst = idx === 15;

                    return (
                      <tr key={item.nome} className="border-b border-black text-black">
                        {/* Nome do Instrumento com cor de fundo do status */}
                        <td
                          className="py-0.5 px-2 border-r border-black font-black text-black tracking-tight"
                          style={{ backgroundColor: corFundo }}
                        >
                          {item.nome}
                        </td>

                        {/* Recomendado GEM */}
                        <td className="py-0.5 px-1.5 border-r border-black text-center font-bold bg-white">
                          {modoEdicao ? (
                            <input
                              type="number"
                              min="0"
                              value={item.recGem}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setMetasGem(prev => ({ ...prev, [item.nome]: val }));
                              }}
                              className="w-10 text-center py-0 border border-blue-600 font-bold bg-blue-50"
                            />
                          ) : (
                            item.recGem
                          )}
                        </td>

                        {/* % REC. (Célula mesclada por Naipe) */}
                        {isCordasFirst && (
                          <td rowSpan={3} className="border-r border-black text-center font-bold bg-white align-middle">
                            {cordasStats.pctRecGem}%
                          </td>
                        )}
                        {isMadeirasFirst && (
                          <td rowSpan={12} className="border-r border-black text-center font-bold bg-white align-middle">
                            {madeirasStats.pctRecGem}%
                          </td>
                        )}
                        {isMetaisFirst && (
                          <td rowSpan={9} className="border-r border-black text-center font-bold bg-white align-middle">
                            {metaisStats.pctRecGem}%
                          </td>
                        )}

                        {/* Alunos GEM */}
                        <td className="py-0.5 px-1 border-r border-black text-center font-semibold bg-white text-xs">
                          {item.gemQtd}
                        </td>

                        {/* Total ORQ + GEM */}
                        <td className="py-0.5 px-1.5 border-r border-black text-center font-black bg-white text-xs">
                          {item.totalComGem}
                        </td>

                        {/* % ORQ + GEM (Célula mesclada com cor de fundo viva!) */}
                        {isCordasFirst && (
                          <td
                            rowSpan={3}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: cordasStats.corGem }}
                          >
                            {cordasStats.pctTotalGem}%
                          </td>
                        )}
                        {isMadeirasFirst && (
                          <td
                            rowSpan={12}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: madeirasStats.corGem }}
                          >
                            {madeirasStats.pctTotalGem}%
                          </td>
                        )}
                        {isMetaisFirst && (
                          <td
                            rowSpan={9}
                            className="text-center font-black text-black align-middle text-xs"
                            style={{ backgroundColor: metaisStats.corGem }}
                          >
                            {metaisStats.pctTotalGem}%
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-white font-black text-black border-t-2 border-black text-center">
                    <td className="py-1 px-2 border-r border-black text-left">TOTAL</td>
                    <td className="py-1 px-1.5 border-r border-black">{totalRecGem}</td>
                    <td className="py-1 px-1 border-r border-black">100%</td>
                    <td className="py-1 px-1 border-r border-black font-semibold">{totalGemAlunos}</td>
                    <td className="py-1 px-1.5 border-r border-black text-xs">{totalOrqComGem}</td>
                    <td className="py-1 px-1.5">100,0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>

          {/* ======================================================== */}
          {/* TABELAS INFERIORES DE VOZES (SOPRANO, CONTRALTO, TENOR, BAIXO) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 gap-4 items-start pt-2">
            
            {/* VOZES OFICIALIZADOS (ESQUERDA) */}
            <div className="border-2 border-black">
              <table className="w-full border-collapse text-[11px] font-sans">
                <tbody>
                  {vozesRows.map(v => (
                    <tr key={v.nome} className="border-b border-black text-black">
                      <td
                        className="py-1 px-2 border-r border-black font-black text-black w-36"
                        style={{ backgroundColor: v.corOfic }}
                      >
                        {v.nome}
                      </td>
                      <td className="py-1 px-1.5 border-r border-black text-center font-bold bg-white w-20">
                        {v.recOfic}
                      </td>
                      <td className="py-1 px-1.5 border-r border-black text-center font-bold bg-white w-14">
                        {v.pctRecOfic}%
                      </td>
                      <td className="py-1 px-1.5 border-r border-black text-center font-black bg-white w-24 text-xs">
                        {v.atualOfic}
                      </td>
                      <td className="py-1 px-1.5 text-center font-bold bg-white w-16">
                        {v.pctAtualOfic}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white font-black text-black border-t-2 border-black text-center">
                    <td className="py-1 px-2 border-r border-black text-left">TOTAL</td>
                    <td className="py-1 px-1.5 border-r border-black">{totalRecOfic}</td>
                    <td className="py-1 px-1.5 border-r border-black">100%</td>
                    <td className="py-1 px-1.5 border-r border-black text-xs">{totalAtualOfic}</td>
                    <td className="py-1 px-1.5">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* VOZES COM GEM (DIREITA) */}
            <div className="border-2 border-black">
              <table className="w-full border-collapse text-[11px] font-sans">
                <tbody>
                  {vozesRows.map(v => (
                    <tr key={v.nome} className="border-b border-black text-black">
                      <td
                        className="py-1 px-2 border-r border-black font-black text-black w-36"
                        style={{ backgroundColor: v.corGem }}
                      >
                        {v.nome}
                      </td>
                      <td className="py-1 px-1.5 border-r border-black text-center font-bold bg-white w-20">
                        {v.recGem}
                      </td>
                      <td className="py-1 px-1 border-r border-black text-center font-bold bg-white w-14">
                        {v.pctRecGem}%
                      </td>
                      <td className="py-1 px-1 border-r border-black text-center font-semibold bg-white w-14 text-slate-500">
                        -
                      </td>
                      <td className="py-1 px-1.5 border-r border-black text-center font-black bg-white w-16 text-xs">
                        {v.totalGem}
                      </td>
                      <td className="py-1 px-1.5 text-center font-bold bg-white w-16">
                        {v.pctTotalGem}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white font-black text-black border-t-2 border-black text-center">
                    <td className="py-1 px-2 border-r border-black text-left">TOTAL</td>
                    <td className="py-1 px-1.5 border-r border-black">{totalRecGem}</td>
                    <td className="py-1 px-1 border-r border-black">100%</td>
                    <td className="py-1 px-1 border-r border-black">-</td>
                    <td className="py-1 px-1.5 border-r border-black text-xs">{totalOrqComGem}</td>
                    <td className="py-1 px-1.5">100%</td>
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
