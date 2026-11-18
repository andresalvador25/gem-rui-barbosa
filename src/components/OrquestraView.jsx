import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  Info, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function OrquestraView({ data, onUpdateConfig }) {
  const config = data?.config || {};
  const musicos = data?.musicos || [];

  const [tipo, setTipo] = useState(config.tipoOrquestra || 'Simples');
  const [metaQtd, setMetaQtd] = useState(config.quantidadeDesejada || 32);
  const [filtroGrupo, setFiltroGrupo] = useState('oficializados'); // 'oficializados' ou 'todos'

  // Sorting state for analytical table
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition shrink-0" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />;
  };

  // Etapas disponíveis dependendo do tipo
  const etapasSimples = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64];
  const etapasCompleta = [
    4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100
  ];

  const etapas = tipo === 'Completa' ? etapasCompleta : etapasSimples;

  // Ajusta metaQtd se fora da faixa
  const metaValida = etapas.includes(Number(metaQtd)) ? Number(metaQtd) : (tipo === 'Completa' ? 48 : 32);
  const etapaIdx = Math.max(0, etapas.indexOf(metaValida));

  // TODOS OS 24 INSTRUMENTOS OFICIAIS DO MOO (Formação Simples)
  // Instrumentos não previstos na simples recebem 0 como ideal
  const tabelaSimples24 = [
    // CORDAS (3)
    { nome: 'Violino', naipe: 'Cordas', voz: 'Soprano e Contralto', valores: [1, 2, 4, 5, 7, 8, 9, 10, 12, 14, 15, 16, 18, 19, 20, 21] },
    { nome: 'Viola', naipe: 'Cordas', voz: 'Tenor', valores: [0, 1, 1, 2, 2, 2, 3, 4, 4, 4, 5, 6, 6, 7, 7, 8] },
    { nome: 'Violoncelo', naipe: 'Cordas', voz: 'Baixo', valores: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3] },
    // MADEIRAS (12)
    { nome: 'Flauta Transversal', naipe: 'Madeiras', voz: 'Soprano 8ª', valores: [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3] },
    { nome: 'Oboé', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Oboé D\'Amore', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Corne Inglês', naipe: 'Madeiras', voz: 'Contralto', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Fagote', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Clarinete', naipe: 'Madeiras', voz: 'Soprano', valores: [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3] },
    { nome: 'Clarinete Alto', naipe: 'Madeiras', voz: 'Tenor', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Clarinete Baixo', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1] },
    { nome: 'Saxofone Soprano', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3] },
    { nome: 'Saxofone Alto', naipe: 'Madeiras', voz: 'Contralto', valores: [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3] },
    { nome: 'Saxofone Tenor', naipe: 'Madeiras', voz: 'Tenor', valores: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Saxofone Barítono', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1] },
    // METAIS (9)
    { nome: 'Trompete', naipe: 'Metais', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2] },
    { nome: 'Cornet', naipe: 'Metais', voz: 'Soprano', valores: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2] },
    { nome: 'Flugelhorn', naipe: 'Metais', voz: 'Contralto', valores: [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Trompa', naipe: 'Metais', voz: 'Contralto', valores: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2] },
    { nome: 'Trombone', naipe: 'Metais', voz: 'Tenor', valores: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3] },
    { nome: 'Trombonito', naipe: 'Metais', voz: 'Tenor', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Eufônio', naipe: 'Metais', voz: 'Baixo', valores: [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Barítono', naipe: 'Metais', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Tuba', naipe: 'Metais', voz: 'Baixo 8ª', valores: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3] }
  ];

  // TODOS OS 24 INSTRUMENTOS OFICIAIS DO MOO (Formação Completa)
  const tabelaCompleta24 = [
    // CORDAS (3)
    { nome: 'Violino', naipe: 'Cordas', voz: 'Soprano e Contralto', valores: [1, 2, 4, 5, 7, 8, 9, 10, 12, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 28, 30, 30] },
    { nome: 'Viola', naipe: 'Cordas', voz: 'Tenor', valores: [0, 1, 1, 2, 2, 2, 3, 4, 4, 4, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 12] },
    { nome: 'Violoncelo', naipe: 'Cordas', voz: 'Baixo', valores: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 7, 7, 8] },
    // MADEIRAS (12)
    { nome: 'Flauta Transversal', naipe: 'Madeiras', voz: 'Soprano 8ª', valores: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3] },
    { nome: 'Oboé', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Oboé D\'Amore', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { nome: 'Corne Inglês', naipe: 'Madeiras', voz: 'Contralto', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2] },
    { nome: 'Fagote', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Clarinete', naipe: 'Madeiras', voz: 'Soprano', valores: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3] },
    { nome: 'Clarinete Alto', naipe: 'Madeiras', voz: 'Tenor', valores: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Clarinete Baixo', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { nome: 'Saxofone Soprano', naipe: 'Madeiras', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3] },
    { nome: 'Saxofone Alto', naipe: 'Madeiras', voz: 'Contralto', valores: [0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3] },
    { nome: 'Saxofone Tenor', naipe: 'Madeiras', voz: 'Tenor', valores: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Saxofone Barítono', naipe: 'Madeiras', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1] },
    // METAIS (9)
    { nome: 'Trompete', naipe: 'Metais', voz: 'Soprano', valores: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4] },
    { nome: 'Cornet', naipe: 'Metais', voz: 'Soprano', valores: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Flugelhorn', naipe: 'Metais', voz: 'Contralto', valores: [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
    { nome: 'Trompa', naipe: 'Metais', voz: 'Contralto', valores: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3] },
    { nome: 'Trombone', naipe: 'Metais', voz: 'Tenor', valores: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5] },
    { nome: 'Trombonito', naipe: 'Metais', voz: 'Tenor', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1] },
    { nome: 'Eufônio', naipe: 'Metais', voz: 'Baixo', valores: [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { nome: 'Barítono', naipe: 'Metais', voz: 'Baixo', valores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { nome: 'Tuba', naipe: 'Metais', voz: 'Baixo 8ª', valores: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6] }
  ];

  const tabelaAtual = tipo === 'Completa' ? tabelaCompleta24 : tabelaSimples24;

  // Filtra músicos pelo grupo selecionado
  const musicosAtivos = musicos.filter(m => {
    if (filtroGrupo === 'oficializados') {
      return m.oficializado || m.fase === 'Oficializado';
    }
    return true; // Todos (Oficializados + Culto + RJM + GEM)
  });

  // Conta instrumentos atuais com correspondência exata para cada um dos 24
  const contagemAtual = (instrumentoNome) => {
    return musicosAtivos.filter(m => {
      const nomeLower = (m.instrumento || '').toLowerCase().trim();
      const alvo = instrumentoNome.toLowerCase().trim();

      if (alvo === 'violino') return nomeLower.includes('violino');
      if (alvo === 'viola') return nomeLower === 'viola';
      if (alvo === 'violoncelo') return nomeLower.includes('violoncelo');
      if (alvo === 'flauta transversal') return nomeLower.includes('flauta');
      if (alvo === 'oboé') return nomeLower === 'oboé' || nomeLower === 'oboe';
      if (alvo === 'oboé d\'amore') return nomeLower.includes('amore');
      if (alvo === 'corne inglês') return nomeLower.includes('corne');
      if (alvo === 'fagote') return nomeLower.includes('fagote');
      if (alvo === 'clarinete') return nomeLower.includes('clarinete') && !nomeLower.includes('alto') && !nomeLower.includes('baixo') && !nomeLower.includes('clarone');
      if (alvo === 'clarinete alto') return nomeLower.includes('clarinete alto') || (nomeLower.includes('clarone') && nomeLower.includes('alto'));
      if (alvo === 'clarinete baixo') return nomeLower.includes('clarinete baixo') || nomeLower.includes('clarone');
      if (alvo === 'saxofone soprano') return nomeLower.includes('saxofone soprano') || nomeLower.includes('sax soprano');
      if (alvo === 'saxofone alto') return nomeLower.includes('saxofone alto') || nomeLower.includes('sax alto');
      if (alvo === 'saxofone tenor') return nomeLower.includes('saxofone tenor') || nomeLower.includes('sax tenor');
      if (alvo === 'saxofone barítono') return nomeLower.includes('saxofone barítono') || nomeLower.includes('sax baritono');
      if (alvo === 'trompete') return nomeLower.includes('trompete');
      if (alvo === 'cornet') return nomeLower.includes('cornet');
      if (alvo === 'flugelhorn') return nomeLower.includes('flugelhorn');
      if (alvo === 'trompa') return nomeLower.includes('trompa');
      if (alvo === 'trombone') return nomeLower === 'trombone';
      if (alvo === 'trombonito') return nomeLower.includes('trombonito');
      if (alvo === 'eufônio') return nomeLower === 'eufônio' || nomeLower === 'eufonio';
      if (alvo === 'barítono') return nomeLower === 'barítono' || nomeLower === 'baritono';
      if (alvo === 'tuba') return nomeLower.includes('tuba');
      return false;
    }).length;
  };

  // Monta diagnóstico
  const diagnostico = tabelaAtual.map(item => {
    const ideal = item.valores[etapaIdx] || 0;
    const atual = contagemAtual(item.nome);
    const dif = atual - ideal;

    let status = 'OK';
    let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    let badgeLabel = 'Adequado';

    if (ideal === 0 && atual === 0) {
      status = 'Opcional';
      statusClass = 'bg-slate-50 text-slate-500 border-slate-200';
      badgeLabel = 'Opcional (0)';
    } else if (dif < 0) {
      status = 'Necessidade';
      statusClass = 'bg-blue-50 text-blue-700 border-blue-300';
      badgeLabel = `Falta ${Math.abs(dif)}`;
    } else if (dif > 0) {
      status = 'Excesso';
      statusClass = 'bg-rose-50 text-rose-700 border-rose-300';
      badgeLabel = `Excesso +${dif}`;
    }

    return {
      ...item,
      ideal,
      atual,
      dif,
      status,
      statusClass,
      badgeLabel
    };
  });

  const sortedDiagnostico = useMemo(() => {
    const list = [...diagnostico];
    if (sortField) {
      list.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [diagnostico, sortField, sortDirection]);

  const totalIdeal = diagnostico.reduce((acc, curr) => acc + curr.ideal, 0);
  const totalAtual = diagnostico.reduce((acc, curr) => acc + curr.atual, 0);

  // Totais por naipe
  const cordasIdeal = diagnostico.filter(d => d.naipe === 'Cordas').reduce((a, b) => a + b.ideal, 0);
  const cordasAtual = diagnostico.filter(d => d.naipe === 'Cordas').reduce((a, b) => a + b.atual, 0);

  const madeirasIdeal = diagnostico.filter(d => d.naipe === 'Madeiras').reduce((a, b) => a + b.ideal, 0);
  const madeirasAtual = diagnostico.filter(d => d.naipe === 'Madeiras').reduce((a, b) => a + b.atual, 0);

  const metaisIdeal = diagnostico.filter(d => d.naipe === 'Metais').reduce((a, b) => a + b.ideal, 0);
  const metaisAtual = diagnostico.filter(d => d.naipe === 'Metais').reduce((a, b) => a + b.atual, 0);

  return (
    <div className="space-y-6">

      {/* Top Header & Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded">
              MOO CCB • 24 Instrumentos
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Adequação e Diagnóstico da Orquestra
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manual de Orientação Orquestral — Relação completa de todos os 24 instrumentos oficiais permitidos.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Seletor Tipo de Orquestra (Simples vs Completa) */}
          <div className="flex items-center bg-blue-50 p-1 rounded-lg border border-blue-200 text-xs">
            <button
              onClick={() => {
                setTipo('Simples');
                if (metaQtd > 64) setMetaQtd(32);
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                tipo === 'Simples' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-900 hover:bg-blue-100'
              }`}
            >
              Orquestra Simples (4-64)
            </button>
            <button
              onClick={() => setTipo('Completa')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                tipo === 'Completa' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-900 hover:bg-blue-100'
              }`}
            >
              Orquestra Completa (4-100)
            </button>
          </div>

          {/* Seletor de Base de Comparação */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFiltroGrupo('oficializados')}
              className={`px-2.5 py-1.5 rounded-md font-bold transition ${
                filtroGrupo === 'oficializados' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oficializados ({musicos.filter(m => m.oficializado || m.fase === 'Oficializado').length})
            </button>
            <button
              onClick={() => setFiltroGrupo('todos')}
              className={`px-2.5 py-1.5 rounded-md font-bold transition ${
                filtroGrupo === 'todos' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orquestra + GEM ({musicos.length})
            </button>
          </div>

          {/* Seletor de Meta (Etapa) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs">
            <span className="font-bold text-slate-700">Meta:</span>
            <select
              value={metaValida}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMetaQtd(val);
                if (onUpdateConfig) onUpdateConfig({ quantidadeDesejada: val });
              }}
              className="bg-white border border-slate-300 rounded font-black text-blue-900 px-2 py-1 outline-none cursor-pointer"
            >
              {etapas.map(q => (
                <option key={q} value={q}>{q} Músicos</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Legenda Oficial CCB */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Legenda Oficial MOO:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-600"></span>
            <span className="font-bold text-blue-950">Azul = Quantidade Necessária (Faltando)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
            <span className="font-bold text-emerald-950">Verde = Quantidade Adequada (OK)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-600"></span>
            <span className="font-bold text-rose-950">Vermelho = Quantidade em Excesso</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-300"></span>
            <span className="font-bold text-slate-600">Cinza = Opcional na etapa</span>
          </div>
        </div>
      </div>

      {/* Resumo dos Naipes (Proporção 50% / 25% / 25%) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cordas */}
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase">Cordas (Ideal 50%)</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-extrabold">
              Ideal: {cordasIdeal}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{cordasAtual}</span>
            <span className={`text-xs font-bold ${cordasAtual < cordasIdeal ? 'text-blue-600' : cordasAtual > cordasIdeal ? 'text-rose-600' : 'text-emerald-600'}`}>
              {cordasAtual - cordasIdeal === 0 ? 'Equilibrado' : cordasAtual - cordasIdeal > 0 ? `+${cordasAtual - cordasIdeal} excesso` : `${cordasAtual - cordasIdeal} faltam`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${Math.min((cordasAtual / (cordasIdeal || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Madeiras */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">Madeiras (Ideal 25%)</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold">
              Ideal: {madeirasIdeal}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{madeirasAtual}</span>
            <span className={`text-xs font-bold ${madeirasAtual < madeirasIdeal ? 'text-blue-600' : madeirasAtual > madeirasIdeal ? 'text-rose-600' : 'text-emerald-600'}`}>
              {madeirasAtual - madeirasIdeal === 0 ? 'Equilibrado' : madeirasAtual - madeirasIdeal > 0 ? `+${madeirasAtual - madeirasIdeal} excesso` : `${madeirasAtual - madeirasIdeal} faltam`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${Math.min((madeirasAtual / (madeirasIdeal || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metais */}
        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase">Metais (Ideal 25%)</span>
            <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-extrabold">
              Ideal: {metaisIdeal}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metaisAtual}</span>
            <span className={`text-xs font-bold ${metaisAtual < metaisIdeal ? 'text-blue-600' : metaisAtual > metaisIdeal ? 'text-rose-600' : 'text-emerald-600'}`}>
              {metaisAtual - metaisIdeal === 0 ? 'Equilibrado' : metaisAtual - metaisIdeal > 0 ? `+${metaisAtual - metaisIdeal} excesso` : `${metaisAtual - metaisIdeal} faltam`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-rose-600 h-full rounded-full"
              style={{ width: `${Math.min((metaisAtual / (metaisIdeal || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Grid com Todos os 24 Instrumentos do MOO */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Quadro Completo dos 24 Instrumentos do MOO (Meta {metaValida} Músicos)
            </h2>
            <p className="text-xs text-slate-500">Exibição de todos os instrumentos previstos pelo Manual de Orientação Orquestral.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            24 Instrumentos Listados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {diagnostico.map((inst, i) => {
            const isFalta = inst.dif < 0;
            const isExcesso = inst.dif > 0;
            const isOk = inst.dif === 0 && inst.ideal > 0;
            const isOpcional = inst.ideal === 0 && inst.atual === 0;

            const cardBorder = isFalta 
              ? 'border-blue-400 bg-blue-50/40' 
              : isExcesso 
              ? 'border-rose-400 bg-rose-50/40' 
              : isOk
              ? 'border-emerald-400 bg-emerald-50/40'
              : 'border-slate-200 bg-slate-50/60 opacity-80';

            const badgeBg = isFalta 
              ? 'bg-blue-600 text-white' 
              : isExcesso 
              ? 'bg-rose-600 text-white' 
              : isOk
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-300 text-slate-700';

            return (
              <div 
                key={i} 
                className={`border-2 rounded-xl p-3 flex flex-col justify-between transition hover:shadow-md ${cardBorder}`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {inst.naipe}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug mt-0.5 truncate" title={inst.nome}>
                    {inst.nome}
                  </h3>
                  <span className="text-[10px] text-slate-500 block truncate" title={inst.voz}>
                    {inst.voz}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Atual:</span>
                    <span className="font-extrabold text-slate-900">{inst.atual}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500">Ideal MOO:</span>
                    <span className="font-bold text-slate-700">{inst.ideal}</span>
                  </div>

                  <div className={`text-center py-1 px-2 rounded-md font-black text-xs shadow-sm ${badgeBg}`}>
                    {isOpcional ? 'Opcional' : isOk ? 'OK' : isFalta ? `${inst.dif}` : `+${inst.dif}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela Completa de Diagnóstico com Todos os Detalhes e Ordenação */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Relação Analítica dos 24 Instrumentos</h2>
            <p className="text-xs text-slate-500">Clique nas colunas para ordenar por Instrumento, Saldo, Ideal ou Atual.</p>
          </div>
          {sortField && (
            <button
              onClick={() => setSortField('')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Restaurar Ordem do MOO
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th 
                  onClick={() => handleSort('nome')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Instrumento"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instrumento</span>
                    {renderSortIcon('nome')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('naipe')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Naipe"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Naipe</span>
                    {renderSortIcon('naipe')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('voz')}
                  className="py-3 px-4 cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Voz"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Voz Principal</span>
                    {renderSortIcon('voz')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ideal')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Quantidade Ideal"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Ideal ({metaValida})</span>
                    {renderSortIcon('ideal')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('atual')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Quantidade Atual"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Atual ({filtroGrupo})</span>
                    {renderSortIcon('atual')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('dif')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Saldo"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Saldo</span>
                    {renderSortIcon('dif')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 text-center cursor-pointer select-none group hover:bg-slate-200/60 transition"
                  title="Ordenar por Diagnóstico"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Diagnóstico</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDiagnostico.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.nome}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.naipe === 'Cordas' ? 'bg-blue-100 text-blue-800' :
                      row.naipe === 'Madeiras' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {row.naipe}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{row.voz}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{row.ideal}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-slate-900">{row.atual}</td>
                  <td className="py-3 px-4 text-center font-black">
                    <span className={row.dif < 0 ? 'text-blue-600' : row.dif > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {row.dif === 0 ? '0' : row.dif > 0 ? `+${row.dif}` : `${row.dif}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                      {row.badgeLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <tr>
                <td className="py-3 px-4 font-black" colSpan="3">TOTAL GERAL DA ORQUESTRA</td>
                <td className="py-3 px-4 text-center text-slate-800 font-black">{totalIdeal}</td>
                <td className="py-3 px-4 text-center text-slate-900 font-black">{totalAtual}</td>
                <td className="py-3 px-4 text-center font-black">
                  {totalAtual - totalIdeal === 0 ? '0' : totalAtual - totalIdeal > 0 ? `+${totalAtual - totalIdeal}` : `${totalAtual - totalIdeal}`}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-extrabold text-xs text-slate-700">
                    {totalAtual >= totalIdeal ? 'Orquestra Formada' : 'Em Complementação'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
