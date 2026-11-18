import React from 'react';

export default function NaipeCards({ integrantes = [], activeNaipeFilter, onSelectNaipe }) {
  // Contadores por naipe
  const stats = {
    Cordas: { total: 0, oficializados: 0, alunos: 0, instrumentos: {} },
    Madeiras: { total: 0, oficializados: 0, alunos: 0, instrumentos: {} },
    Metais: { total: 0, oficializados: 0, alunos: 0, instrumentos: {} },
    'Teclas / Organistas': { total: 0, oficializados: 0, alunos: 0, instrumentos: {} }
  };

  integrantes.forEach(item => {
    const naipe = item.naipe || 'Cordas';
    if (!stats[naipe]) {
      stats[naipe] = { total: 0, oficializados: 0, alunos: 0, instrumentos: {} };
    }
    stats[naipe].total += 1;
    // Checa pelo campo boolean oficializado ou situacao
    const isOfic = item.oficializado === true || item.situacao === 'Oficializado';
    if (isOfic) {
      stats[naipe].oficializados += 1;
    } else {
      stats[naipe].alunos += 1;
    }

    const inst = item.instrumento || 'Não informado';
    stats[naipe].instrumentos[inst] = (stats[naipe].instrumentos[inst] || 0) + 1;
  });

  const cards = [
    {
      id: 'Cordas',
      title: 'Cordas',
      subtitle: 'Violinos, Violas, Violoncelos',
      icon: '🎻',
      gradient: 'from-blue-600 to-indigo-700',
      bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'Madeiras',
      title: 'Madeiras',
      subtitle: 'Flautas, Clarinetes, Saxofones, Oboés',
      icon: '🪵',
      gradient: 'from-emerald-600 to-teal-700',
      bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'Metais',
      title: 'Metais',
      subtitle: 'Trompetes, Trompas, Trombones, Tubas',
      icon: '🎺',
      gradient: 'from-amber-600 to-orange-700',
      bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'Teclas / Organistas',
      title: 'Organistas',
      subtitle: 'Órgão Eletrônico (Cultos e RJM)',
      icon: '🎹',
      gradient: 'from-purple-600 to-pink-700',
      bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(card => {
        const data = stats[card.id] || { total: 0, oficializados: 0, alunos: 0, instrumentos: {} };
        const isSelected = activeNaipeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectNaipe(isSelected ? 'Todos' : card.id)}
            className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border shadow-sm hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-blue-600 border-transparent bg-white shadow-lg scale-[1.02]'
                : 'bg-white hover:border-slate-300 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-2 rounded-xl bg-slate-100 flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                    {card.title}
                    {isSelected && (
                      <span className="text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Filtrado
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 leading-tight">{card.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{data.total}</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">total</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {data.oficializados} Ofic.
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {data.alunos} Não Ofic.
                </span>
              </div>
              <span className="text-[11px] text-blue-600 hover:underline font-medium">
                {isSelected ? 'Ver Todos' : 'Filtrar'}
              </span>
            </div>

            {/* Instrumentos cadastrados */}
            {Object.keys(data.instrumentos).length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {Object.entries(data.instrumentos).slice(0, 4).map(([inst, count]) => (
                  <span
                    key={inst}
                    className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                  >
                    {inst}: <strong>{count}</strong>
                  </span>
                ))}
                {Object.keys(data.instrumentos).length > 4 && (
                  <span className="text-[10px] text-slate-400 px-1 py-0.5">
                    +{Object.keys(data.instrumentos).length - 4} outros
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400 italic">Nenhum integrante ainda</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
