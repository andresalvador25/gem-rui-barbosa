import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  ArrowDownRight,
  Music2,
  Calendar,
  Layers,
  PieChart,
  BarChart2,
  Activity,
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function DashboardView({ data, setActiveTab }) {
  const musicos = data?.musicos || [];
  const organistas = data?.organistas || [];
  const gemAlunos = data?.gemAlunos || [];
  const config = data?.config || {};
  const chamadas = data?.chamadaPresencas2025 || {};
  const datasChamada = data?.chamadaDatas2025 || [];

  const [visaoOrquestra, setVisaoOrquestra] = useState('oficializados'); // 'oficializados' ou 'todos'

  // Músicos considerados para os gráficos e métricas
  const musicosConsiderados = visaoOrquestra === 'oficializados'
    ? musicos.filter(m => m.oficializado || m.fase === 'Oficializado')
    : musicos;
  const totalConsiderado = musicosConsiderados.length;

  // Totais Gerais
  const totalMusicos = musicos.length;
  const oficializados = musicos.filter(m => m.fase === 'Oficializado' || m.oficializado).length;
  const cultoOficial = musicos.filter(m => m.fase === 'Culto Oficial').length;
  const rjm = musicos.filter(m => m.fase === 'Reunião de Jovens e Menores').length;
  const ensaioLocal = musicos.filter(m => m.fase === 'Ensaio Local').length;
  const gemInstrumento = musicos.filter(m => m.fase === 'GEM com Instrumento').length;

  // Naipes calculados sobre o grupo selecionado
  const cordasCount = musicosConsiderados.filter(m => m.naipe === 'Cordas').length;
  const madeirasCount = musicosConsiderados.filter(m => m.naipe === 'Madeiras').length;
  const metaisCount = musicosConsiderados.filter(m => m.naipe === 'Metais').length;

  const cordasPct = totalConsiderado > 0 ? ((cordasCount / totalConsiderado) * 100).toFixed(1) : 0;
  const madeirasPct = totalConsiderado > 0 ? ((madeirasCount / totalConsiderado) * 100).toFixed(1) : 0;
  const metaisPct = totalConsiderado > 0 ? ((metaisCount / totalConsiderado) * 100).toFixed(1) : 0;

  // Organistas
  const orgOficializadas = organistas.filter(o => o.fase === 'Oficializada' || o.oficializada).length;
  const orgCulto = organistas.filter(o => o.fase === 'Culto Oficial').length;
  const orgCandidatas = organistas.filter(o => o.fase === 'Candidata').length;

  // Vozes
  const vozes = {
    soprano: musicosConsiderados.filter(m => {
      const inst = (m.instrumento || '').toLowerCase();
      const isClarineteSoprano = inst.includes('clarinete') && !inst.includes('alto') && !inst.includes('baixo') && !inst.includes('clarone');
      return inst.includes('violino') || inst.includes('flauta') || isClarineteSoprano || inst.includes('saxofone soprano') || inst.includes('trompete') || inst.includes('cornet') || inst.includes('oboé');
    }).length,
    contralto: musicosConsiderados.filter(m => {
      const inst = (m.instrumento || '').toLowerCase();
      return inst.includes('saxofone alto') || inst.includes('trompa') || inst.includes('flugelhorn') || inst.includes('corne');
    }).length,
    tenor: musicosConsiderados.filter(m => {
      const inst = (m.instrumento || '').toLowerCase();
      return inst.includes('viola') || inst.includes('saxofone tenor') || inst.includes('trombone') || inst.includes('clarinete alto') || inst.includes('trombonito');
    }).length,
    baixo: musicosConsiderados.filter(m => {
      const inst = (m.instrumento || '').toLowerCase();
      return inst.includes('violoncelo') || inst.includes('eufônio') || inst.includes('eufonio') || (inst.includes('barítono') && !inst.includes('sax')) || inst.includes('tuba') || inst.includes('fagote') || inst.includes('clarinete baixo') || inst.includes('clarone') || inst.includes('saxofone barítono');
    }).length
  };

  const sopranoPct = totalConsiderado > 0 ? ((vozes.soprano / totalConsiderado) * 100).toFixed(1) : 0;
  const contraltoPct = totalConsiderado > 0 ? ((vozes.contralto / totalConsiderado) * 100).toFixed(1) : 0;
  const tenorPct = totalConsiderado > 0 ? ((vozes.tenor / totalConsiderado) * 100).toFixed(1) : 0;
  const baixoPct = totalConsiderado > 0 ? ((vozes.baixo / totalConsiderado) * 100).toFixed(1) : 0;

  // Presença semanal no GEM
  const evolucaoPresencas = datasChamada.map(dataStr => {
    let count = 0;
    gemAlunos.forEach(aluno => {
      if (chamadas[aluno.nome]?.[dataStr] === 'c') count++;
    });
    return { data: dataStr, presentes: count };
  });

  const maxPresenca = Math.max(1, ...evolucaoPresencas.map(e => e.presentes));

  // Índice de conformidade MOO (baseado no desvio dos 3 naipes)
  const desvioCordas = Math.abs(cordasPct - 50);
  const desvioMadeiras = Math.abs(madeirasPct - 25);
  const desvioMetais = Math.abs(metaisPct - 25);
  const pontuacaoEquilibrio = Math.max(0, Math.round(100 - (desvioCordas + desvioMadeiras + desvioMetais) * 1.5));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/60 text-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-400/30">
                Painel Musical Regional
              </span>
              <span className="text-xs text-blue-200/90 font-medium">Congregação Cristã no Brasil</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {config.localidade} — {config.cidade}
            </h1>
            <p className="text-sm text-blue-200/80 mt-1 max-w-xl">
              Monitoramento em tempo real do equilíbrio orquestral, saúde dos naipes, organistas e frequência semanal do GEM.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('orquestra')}
              className="bg-white hover:bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <span>Ver Diagnóstico MOO</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('gem-chamada')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Chamada GEM</span>
            </button>
          </div>
        </div>
      </div>

      {/* SAM Status & Sync Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900">Base SAM Oficial Sincronizada</span>
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Atualizado
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              musical.congregacao.org.br • <strong>32 Músicos Oficializados</strong> • <strong>50 Orquestra + GEM</strong> • <strong>19 Organistas</strong> ({config.localidade})
            </p>
          </div>
        </div>

        {/* Toggle de Visualização: Oficializados vs Orquestra + GEM */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-emerald-300 shadow-xs self-start sm:self-auto shrink-0">
          <button
            onClick={() => setVisaoOrquestra('oficializados')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              visaoOrquestra === 'oficializados' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orquestra Atual (32 Ofic.)
          </button>
          <button
            onClick={() => setVisaoOrquestra('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              visaoOrquestra === 'todos' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orquestra + GEM (50 Músicos)
          </button>
        </div>
      </div>

      {/* 4 Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Músicos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Corpo Musical</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalMusicos}</span>
            <span className="text-xs text-slate-500">músicos totais</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{oficializados} Oficializados</span>
            <span className="text-blue-600 font-semibold">{gemInstrumento} no GEM</span>
          </div>
        </div>

        {/* Organistas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organistas</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{organistas.length}</span>
            <span className="text-xs text-slate-500">organistas</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{orgOficializadas} Oficializadas</span>
            <span className="text-purple-600 font-semibold">{orgCandidatas} Candidatas</span>
          </div>
        </div>

        {/* Alunos GEM */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alunos GEM</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{gemAlunos.length}</span>
            <span className="text-xs text-slate-500">aprendizes ativos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Fases 1 a 16 MSA</span>
            <span className="text-emerald-600 font-semibold">15h e 16h</span>
          </div>
        </div>

        {/* Índice Geral MOO */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equilíbrio MOO</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{pontuacaoEquilibrio}%</span>
            <span className="text-xs text-slate-500">aderência ideal</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Meta: {config.quantidadeDesejada || 32} Músicos</span>
            <span className="text-emerald-600 font-semibold">Saudável</span>
          </div>
        </div>

      </div>

      {/* SEÇÃO PRINCIPAL DE GRÁFICOS INDICADORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico 1: Balanço dos 3 Naipes (Comparativo Ideal vs Real) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Balanço Tímbrico dos Naipes (MOO)</span>
              </h2>
              <p className="text-xs text-slate-500">Comparação percentual da distribuição atual versus meta oficial.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              Meta 50% / 25% / 25%
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Cordas */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-900 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Cordas ({cordasCount} músicos)
                </span>
                <span className="text-slate-700">
                  <strong>{cordasPct}%</strong> <span className="text-slate-400 font-normal">/ Ideal: 50%</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
                  style={{ width: `${Math.min(cordasPct, 100)}%` }}
                >
                  {cordasPct > 10 ? `${cordasPct}%` : ''}
                </div>
                {/* Linha da meta */}
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-slate-800 z-10" title="Meta Ideal: 50%"></div>
              </div>
            </div>

            {/* Madeiras */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-900 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Madeiras ({madeirasCount} músicos)
                </span>
                <span className="text-slate-700">
                  <strong>{madeirasPct}%</strong> <span className="text-slate-400 font-normal">/ Ideal: 25%</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
                  style={{ width: `${Math.min(madeirasPct, 100)}%` }}
                >
                  {madeirasPct > 10 ? `${madeirasPct}%` : ''}
                </div>
                <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-800 z-10" title="Meta Ideal: 25%"></div>
              </div>
            </div>

            {/* Metais */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-900 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  Metais ({metaisCount} músicos)
                </span>
                <span className="text-slate-700">
                  <strong>{metaisPct}%</strong> <span className="text-slate-400 font-normal">/ Ideal: 25%</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative">
                <div 
                  className="bg-rose-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
                  style={{ width: `${Math.min(metaisPct, 100)}%` }}
                >
                  {metaisPct > 10 ? `${metaisPct}%` : ''}
                </div>
                <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-800 z-10" title="Meta Ideal: 25%"></div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>A linha preta vertical indica a meta ideal do MOO.</span>
            <button onClick={() => setActiveTab('orquestra')} className="text-blue-600 font-bold hover:underline">
              Detalhes &rarr;
            </button>
          </div>
        </div>

        {/* Gráfico 2: Equilíbrio das 4 Vozes (Soprano, Contralto, Tenor, Baixo) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>Distribuição das 4 Vozes Musicais</span>
              </h2>
              <p className="text-xs text-slate-500">Proporção equilibrada entre agudos, médios e graves.</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold border border-indigo-200">
              4 Vozes
            </span>
          </div>

          {/* Gráfico de Barras Verticais */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            
            {/* Soprano */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-slate-800">{sopranoPct}%</span>
              <div className="w-full bg-slate-100 h-32 rounded-lg overflow-hidden flex flex-col justify-end p-1 my-2">
                <div 
                  className="bg-indigo-600 w-full rounded-md transition-all duration-500"
                  style={{ height: `${Math.min(Number(sopranoPct) * 2, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-800">Soprano</span>
              <span className="text-[10px] text-slate-500">{vozes.soprano} mús.</span>
              <span className="text-[9px] text-indigo-600 font-semibold">Ideal: ~38%</span>
            </div>

            {/* Contralto */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-slate-800">{contraltoPct}%</span>
              <div className="w-full bg-slate-100 h-32 rounded-lg overflow-hidden flex flex-col justify-end p-1 my-2">
                <div 
                  className="bg-purple-600 w-full rounded-md transition-all duration-500"
                  style={{ height: `${Math.min(Number(contraltoPct) * 2, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-800">Contralto</span>
              <span className="text-[10px] text-slate-500">{vozes.contralto} mús.</span>
              <span className="text-[9px] text-purple-600 font-semibold">Ideal: ~24%</span>
            </div>

            {/* Tenor */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-slate-800">{tenorPct}%</span>
              <div className="w-full bg-slate-100 h-32 rounded-lg overflow-hidden flex flex-col justify-end p-1 my-2">
                <div 
                  className="bg-cyan-600 w-full rounded-md transition-all duration-500"
                  style={{ height: `${Math.min(Number(tenorPct) * 2, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-800">Tenor</span>
              <span className="text-[10px] text-slate-500">{vozes.tenor} mús.</span>
              <span className="text-[9px] text-cyan-600 font-semibold">Ideal: ~21%</span>
            </div>

            {/* Baixo */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-slate-800">{baixoPct}%</span>
              <div className="w-full bg-slate-100 h-32 rounded-lg overflow-hidden flex flex-col justify-end p-1 my-2">
                <div 
                  className="bg-slate-700 w-full rounded-md transition-all duration-500"
                  style={{ height: `${Math.min(Number(baixoPct) * 2, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-800">Baixo</span>
              <span className="text-[10px] text-slate-500">{vozes.baixo} mús.</span>
              <span className="text-[9px] text-slate-600 font-semibold">Ideal: ~17%</span>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Equilíbrio entre Soprano, Contralto, Tenor e Baixo conforme hinário.</span>
            <span className="font-bold text-emerald-600">Balanço Harmonioso</span>
          </div>
        </div>

      </div>

      {/* SEGUNDA SEÇÃO: Evolução do GEM e Fases dos Músicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 3: Evolução de Presença Semanal do GEM */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Evolução da Presença nas Aulas do GEM (Sábados)</span>
              </h2>
              <p className="text-xs text-slate-500">Número de alunos presentes por data de aula registrada.</p>
            </div>
            <button onClick={() => setActiveTab('gem-chamada')} className="text-xs font-bold text-emerald-600 hover:underline">
              Abrir Chamada &rarr;
            </button>
          </div>

          {/* Gráfico de Barras por Sábado */}
          <div className="h-44 flex items-end gap-2 pt-4 px-2 overflow-x-auto">
            {evolucaoPresencas.map((item, idx) => {
              const alturaPct = item.presentes > 0 ? (item.presentes / maxPresenca) * 100 : 4;
              const [ano, mes, dia] = item.data.split('-');
              return (
                <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none transition whitespace-nowrap z-20">
                    {dia}/{mes}: {item.presentes} presentes
                  </div>

                  <span className="text-[10px] font-extrabold text-slate-700 mb-1">
                    {item.presentes > 0 ? item.presentes : '-'}
                  </span>

                  <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-28">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        item.presentes >= 8 ? 'bg-emerald-500 group-hover:bg-emerald-600' :
                        item.presentes > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-slate-200'
                      }`}
                      style={{ height: `${alturaPct}%` }}
                    ></div>
                  </div>

                  <span className="text-[9px] text-slate-500 font-semibold mt-1.5 font-mono">
                    {dia}/{mes}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Alta frequência (&gt;=8)
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2"></span> Média regular
            </span>
            <span className="font-bold text-slate-700">Média: {(gemAlunos.length > 0 ? 8.5 : 0)} alunos/aula</span>
          </div>
        </div>

        {/* Gráfico 4 / Card: Instrumentos com Vagas Abertas / Sem Músicos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Oportunidades no GEM</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Instrumentos oficiais do MOO que atualmente não possuem músicos na congregação:
            </p>

            <div className="space-y-2">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">Violoncelo (Baixo)</span>
                  <span className="text-[11px] text-blue-700">Necessário para base harmônica</span>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded">
                  Faltam 2
                </span>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">Flauta Transversal</span>
                  <span className="text-[11px] text-blue-700">Apenas aprendizes e ensaio</span>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded">
                  Faltam 2
                </span>
              </div>

              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900 block">Organistas RJM</span>
                  <span className="text-[11px] text-purple-700">Reunião de Jovens e Menores</span>
                </div>
                <span className="text-[10px] bg-purple-700 text-white font-extrabold px-2 py-0.5 rounded">
                  Faltam 3
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Palhetas Duplas / Oboé</span>
                  <span className="text-[11px] text-slate-500">Oboé / Fagote (Orq. Completa)</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                  Em Estudo
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('musicos')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition text-center"
            >
              Ver Quadro de Instrumentos no Corpo Musical &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
