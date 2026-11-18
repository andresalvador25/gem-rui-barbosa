import React, { useState } from 'react';
import { BarChart3, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function ComboChartExcel({ 
  titulo = 'Músicos Oficializados (Orq. Completa)',
  instrumentos = [],
  modo = 'oficializados', // 'oficializados' ou 'com_gem'
  onToggleModo,
  metaTotal = 32,
  atualTotal = 33
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Dimensões SVG do gráfico (otimizado para layout compacto e nítido)
  const svgWidth = 1000;
  const svgHeight = 390;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 28;
  const chartBottom = 265; // Y base das colunas
  const chartHeight = chartBottom - paddingTop; // 237px
  const chartWidth = svgWidth - paddingLeft - paddingRight; // 930px

  const totalItems = instrumentos.length;
  const stepX = chartWidth / (totalItems || 1);

  // Escala Y: de 0 até o valor máximo (mínimo 12 para bater com a planilha)
  const maxDado = Math.max(
    12,
    ...instrumentos.map(i => Math.max(i.atual || 0, i.rec || 0))
  );
  // Arredonda para múltiplo par mais próximo
  const maxY = Math.ceil(maxDado / 2) * 2;
  const yTicks = [];
  for (let t = 0; t <= maxY; t += 2) {
    yTicks.push(t);
  }

  const getYPos = (val) => {
    return chartBottom - (val / maxY) * chartHeight;
  };

  const getXPos = (idx) => {
    return paddingLeft + idx * stepX + stepX / 2;
  };

  // Coordenadas da linha contínua laranja de RECOMENDADO
  const linePoints = instrumentos.map((item, idx) => {
    const x = getXPos(idx);
    const y = getYPos(item.rec || 0);
    return `${x},${y}`;
  }).join(' ');

  const hoveredItem = hoveredIdx !== null ? instrumentos[hoveredIdx] : null;

  return (
    <div className="bg-[#111827] text-white rounded-2xl shadow-xl border border-slate-800 overflow-hidden font-sans animate-fadeIn">
      {/* Header do Gráfico com Título e Alternador de Modo */}
      <div className="bg-[#1f2937]/90 px-4 py-3 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
              {titulo}
            </h3>
            <span className="text-[11px] text-slate-400">
              Meta Recomendada: <strong className="text-amber-400">{metaTotal}</strong> | Atual: <strong className="text-blue-400">{atualTotal}</strong> Músicos
            </span>
          </div>
        </div>

        {/* Botões de alternância rápida de modo integrados */}
        {onToggleModo && (
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => onToggleModo('oficializados')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                modo === 'oficializados'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Oficializados
            </button>
            <button
              onClick={() => onToggleModo('com_gem')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                modo === 'com_gem'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orq. + GEM
            </button>
          </div>
        )}
      </div>

      {/* Tooltip Dinâmico Informativo ao Passar o Mouse */}
      <div className="h-6 px-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
        {hoveredItem ? (
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white uppercase tracking-wider">
              {hoveredItem.nome}:
            </span>
            <span className="text-slate-300">
              Atual: <strong className="text-white">{hoveredItem.atual}</strong>
            </span>
            <span className="text-slate-300">
              Recomendado: <strong className="text-amber-400">{hoveredItem.rec}</strong>
            </span>
            <span className="font-bold">
              {hoveredItem.atual < hoveredItem.rec ? (
                <span className="text-sky-400">Falta {hoveredItem.rec - hoveredItem.atual}</span>
              ) : hoveredItem.atual > hoveredItem.rec ? (
                <span className="text-rose-400">Excesso +{hoveredItem.atual - hoveredItem.rec}</span>
              ) : (
                <span className="text-emerald-400">Ideal</span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 italic">
            Passe o mouse sobre as colunas para ver detalhes de cada instrumento
          </span>
        )}
      </div>

      {/* Área do Gráfico SVG com Fundo Azul Metálico Original do Excel */}
      <div className="p-3 sm:p-5 overflow-x-auto">
        <div className="min-w-[820px] relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none overflow-visible"
          >
            <defs>
              {/* Gradiente azul característico da planilha Excel */}
              <linearGradient id="excelBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4671a6" />
                <stop offset="100%" stopColor="#5b9bd5" />
              </linearGradient>

              {/* Sombra para destaque no hover */}
              <filter id="excelDropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Fundo Azul Retangular da Área de Plotagem */}
            <rect
              x={paddingLeft}
              y={paddingTop}
              width={chartWidth}
              height={chartHeight}
              fill="url(#excelBgGrad)"
              stroke="#2c4b69"
              strokeWidth="1.5"
            />

            {/* Linhas de Grade Horizontais e Rótulos do Eixo Y */}
            {yTicks.map(val => {
              const y = getYPos(val);
              return (
                <g key={val}>
                  {/* Linha horizontal branca translúcida */}
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="#ffffff"
                    strokeOpacity="0.32"
                    strokeWidth="1"
                  />
                  {/* Texto do Eixo Y */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* BARRAS: ORQUESTRA R. BARBOSA */}
            {instrumentos.map((item, idx) => {
              const xCenter = getXPos(idx);
              const barWidth = 20;
              const xLeft = xCenter - barWidth / 2;
              const atual = item.atual || 0;
              const rec = item.rec || 0;
              const yTop = getYPos(atual);
              const bHeight = chartBottom - yTop;

              // Cores originais da planilha:
              // - Se atual < rec: Azul claro (#8ea9db)
              // - Se atual === rec (e rec > 0): Verde (#548235)
              // - Se atual > rec: Vermelho (#c00000)
              let barColor = '#8ea9db';
              if (atual === rec && rec > 0) {
                barColor = '#548235';
              } else if (atual > rec) {
                barColor = '#c00000';
              }

              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={item.nome}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {/* Barra */}
                  {atual > 0 && (
                    <rect
                      x={xLeft}
                      y={yTop}
                      width={barWidth}
                      height={bHeight}
                      fill={barColor}
                      stroke="#000000"
                      strokeWidth={isHovered ? '2' : '1.2'}
                      filter={isHovered ? 'url(#excelDropShadow)' : undefined}
                      opacity={isHovered ? 1 : 0.95}
                    />
                  )}

                  {/* Número de valor em cima da barra */}
                  <text
                    x={xCenter}
                    y={atual > 0 ? yTop - 5 : chartBottom - 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="Arial, sans-serif"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {atual}
                  </text>
                </g>
              );
            })}

            {/* LINHA LARANJA CONTÍNUA DE RECOMENDADO (MOO) */}
            <polyline
              fill="none"
              stroke="#ed7d31"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={linePoints}
              style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.6))' }}
            />

            {/* Marcadores / Pontos na linha de Recomendado */}
            {instrumentos.map((item, idx) => {
              const x = getXPos(idx);
              const y = getYPos(item.rec || 0);
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={'point-' + idx}
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill="#ffffff"
                  stroke="#ed7d31"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                />
              );
            })}

            {/* Rótulos do Eixo X: Nomes dos Instrumentos Inclinados em -52° */}
            {instrumentos.map((item, idx) => {
              const x = getXPos(idx);
              const y = chartBottom + 12;
              const isHovered = hoveredIdx === idx;

              return (
                <text
                  key={'label-' + idx}
                  x={x}
                  y={y}
                  textAnchor="end"
                  transform={`rotate(-52, ${x}, ${y})`}
                  fill={isHovered ? '#38bdf8' : '#ffffff'}
                  fontSize="10.5"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  letterSpacing="0.2px"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {item.nome}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legenda Oficial Compacta */}
      <div className="bg-[#1f2937]/80 px-4 py-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-5">
          {/* Barra Azul: ORQUESTRA R. BARBOSA */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-[#5b9bd5] border border-black inline-block"></span>
            <span className="text-white text-[11px] sm:text-xs">ORQUESTRA R. BARBOSA</span>
          </div>

          {/* Linha Laranja: RECOMENDADO */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 bg-[#ed7d31] inline-block rounded-full"></span>
            <span className="text-white text-[11px] sm:text-xs">RECOMENDADO</span>
          </div>
        </div>

        {/* Indicadores de cores da planilha */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8ea9db]"></span> Azul: Falta
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#548235]"></span> Verde: Ideal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c00000]"></span> Vermelho: Excesso
          </span>
        </div>
      </div>
    </div>
  );
}
